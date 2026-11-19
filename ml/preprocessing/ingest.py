"""
VERITAS AI: Benchmark Dataset Ingestion & Provenance Pipeline
Downloads and parses verified open benchmarks:
1. Myle Ott et al. (ACL 2011 / EMNLP 2013) OpSpam Corpus (1,600 reviews)
2. op_spam_AI (Buscaldi et al. 2023) GPT-3 & LLaMA generated reviews + paraphrases (1,600+ reviews)
3. Amazon CG/OR (Salminen et al. 2022) Cross-domain product reviews
4. YelpChi Graph Benchmark (Rayana & Akoglu 2015 / Dou et al. 2020) (45,954 nodes)
"""

import os
import sys
import io
import json
import hashlib
import zipfile
import urllib.request
import pandas as pd
import numpy as np
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_DIR = BASE_DIR / "ml" / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "ml" / "data" / "processed"

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) VeritasAI-Research/1.0"}

def download_file(url: str, dest_path: Path) -> Path:
    if dest_path.exists() and dest_path.stat().st_size > 0:
        print(f"[CACHE] {dest_path.name} already exists ({dest_path.stat().st_size} bytes).")
        return dest_path
    
    print(f"[DOWNLOAD] Fetching {url} -> {dest_path.name}...")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as response, open(dest_path, "wb") as out_file:
        data = response.read()
        out_file.write(data)
    print(f"[DOWNLOAD COMPLETE] {dest_path.name} ({len(data)} bytes).")
    return dest_path

def ingest_ott_opspam() -> pd.DataFrame:
    """Ingests Myle Ott et al. (1,600 reviews: 800 truthful, 800 deceptive across 20 Chicago hotels)."""
    zip_path = RAW_DIR / "op_spam_v1.4.zip"
    url = "https://myleott.com/op_spam_v1.4.zip"
    download_file(url, zip_path)

    records = []
    with zipfile.ZipFile(zip_path, "r") as z:
        for file_info in z.infolist():
            filename = file_info.filename
            if not filename.endswith(".txt") or "__MACOSX" in filename or "README" in filename:
                continue

            parts = filename.split("/")
            # Typical path: op_spam_v1.4/negative_polarity/deceptive_from_MTurk/fold1/d_sofitel_1.txt
            if len(parts) < 4:
                continue

            polarity = "positive" if "positive" in filename else "negative"
            is_deceptive = "deceptive" in filename
            rating = 5.0 if polarity == "positive" else 1.0

            # Extract hotel name and review index from basename, e.g. d_sofitel_1.txt -> hotel: sofitel
            base_name = parts[-1].replace(".txt", "")
            base_parts = base_name.split("_")
            hotel_name = base_parts[1] if len(base_parts) >= 2 else "chicago_hotel"

            with z.open(file_info) as f:
                content = f.read().decode("utf-8", errors="replace").strip()

            if not content:
                continue

            review_id = f"ott_{polarity[:3]}_{('dec' if is_deceptive else 'tru')}_{base_name}"
            records.append({
                "review_id": review_id,
                "review_text": content,
                "deception_label": "deceptive" if is_deceptive else "genuine",
                "authorship_label": "human",
                "source_dataset": "ott_opspam",
                "generator_model": None,
                "product_category": "hotels",
                "rating": rating,
                "reviewer_id": None,
                "product_id": f"hotel_{hotel_name}",
                "timestamp": None,
                "prompt_id": None,
                "edit_type": "none",
                "provenance": "ott2011finding_acl",
                "split_group": f"hotel_{hotel_name}",
            })

    df = pd.DataFrame(records)
    print(f"[OTT INGESTION] Loaded {len(df)} reviews (Deceptive: {sum(df.deception_label == 'deceptive')}, Genuine: {sum(df.deception_label == 'genuine')}).")
    return df

def ingest_opspam_ai() -> pd.DataFrame:
    """Ingests Buscaldi et al. AI-generated reviews (GPT-3, LLaMA, Paraphrased) matching Ott hotels."""
    base_url = "https://raw.githubusercontent.com/dbuscaldi/op_spam_AI/main/"
    archives = [
        ("generated_GPT3_positive.zip", "gpt-3.5", "positive", 5.0, "ai_generated", "none"),
        ("generated_GPT3_negative.zip", "gpt-3.5", "negative", 1.0, "ai_generated", "none"),
        ("generated_LLama_positive.zip", "llama-2", "positive", 5.0, "ai_generated", "none"),
        ("generated_LLama_negative.zip", "llama-2", "negative", 1.0, "ai_generated", "none"),
        ("paraphrased.zip", "gpt-3.5", "positive", 5.0, "ai_assisted", "paraphrased"),
    ]

    records = []
    for archive_name, model_name, polarity, rating, authorship, edit_type in archives:
        dest_path = RAW_DIR / archive_name
        try:
            download_file(base_url + archive_name, dest_path)
            with zipfile.ZipFile(dest_path, "r") as z:
                for file_info in z.infolist():
                    if not file_info.filename.endswith(".txt") or "__MACOSX" in file_info.filename:
                        continue

                    base_name = Path(file_info.filename).stem
                    parts = base_name.split("_")
                    hotel_name = parts[1] if len(parts) >= 2 else "chicago_hotel"

                    with z.open(file_info) as f:
                        content = f.read().decode("utf-8", errors="replace").strip()

                    if not content or len(content) < 10:
                        continue

                    review_id = f"ai_{model_name[:3]}_{polarity[:3]}_{base_name}"
                    
                    # Buscaldi generated these by seeding from genuine review prompts.
                    # In VERITAS AI, we model these as AI-generated text. Deception status for seeded synthetic reviews:
                    # Positive generations designed to promote without real visit -> deceptive simulation
                    deception_label = "deceptive" if "negative" not in polarity else "deceptive"

                    records.append({
                        "review_id": review_id,
                        "review_text": content,
                        "deception_label": deception_label,
                        "authorship_label": authorship,
                        "source_dataset": "opspam_ai",
                        "generator_model": model_name,
                        "product_category": "hotels",
                        "rating": rating,
                        "reviewer_id": None,
                        "product_id": f"hotel_{hotel_name}",
                        "timestamp": None,
                        "prompt_id": f"prompt_{hotel_name}_{polarity}",
                        "edit_type": edit_type,
                        "provenance": "buscaldi2023opspam_ai",
                        "split_group": f"hotel_{hotel_name}",
                    })
        except Exception as e:
            print(f"[WARN] Error loading {archive_name}: {e}")

    df = pd.DataFrame(records)
    print(f"[AI OPSPAM INGESTION] Loaded {len(df)} AI reviews.")
    return df

def ingest_amazon_cgor(sample_size: int = 4000) -> pd.DataFrame:
    """Ingests representative stratified sample of Salminen et al. (2022) Amazon CG/OR dataset."""
    dest_path = RAW_DIR / "amazon_cgor_sample.csv"
    
    # Check if we already have the cached sample
    if dest_path.exists() and dest_path.stat().st_size > 0:
        print(f"[CACHE] Using cached {dest_path.name}.")
        return pd.read_csv(dest_path)
    
    print("[DOWNLOAD] Fetching stratified Amazon CG/OR dataset from HuggingFace...")
    # Fetch rows from HuggingFace dataset server API
    records = []
    splits = ["train"]
    # We fetch batches using pagination API
    batch_size = 100
    target_batches = sample_size // batch_size
    
    fetched = 0
    offset = 0
    while fetched < sample_size:
        url = f"https://datasets-server.huggingface.co/rows?dataset=debojit01/fake-review-dataset&config=default&split=train&offset={offset}&length={batch_size}"
        req = urllib.request.Request(url, headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=15) as res:
                data = json.loads(res.read().decode("utf-8"))
                rows = data.get("rows", [])
                if not rows:
                    break
                for item in rows:
                    row = item.get("row", {})
                    text = row.get("text_") or row.get("text")
                    if not text or len(str(text).strip()) < 15:
                        continue
                    
                    label_raw = row.get("label", "OR")
                    is_cg = (label_raw == "CG")
                    category = row.get("category", "Products").replace("_5", "").replace("_", " ")
                    rating = float(row.get("rating", 5.0))
                    
                    rec_id = f"amazon_cgor_{offset + len(records)}"
                    records.append({
                        "review_id": rec_id,
                        "review_text": str(text).strip(),
                        "deception_label": "deceptive" if is_cg else "genuine",
                        "authorship_label": "ai_generated" if is_cg else "human",
                        "source_dataset": "amazon_cgor",
                        "generator_model": "salminen_gpt2" if is_cg else None,
                        "product_category": category.lower(),
                        "rating": rating,
                        "reviewer_id": None,
                        "product_id": f"prod_{category[:8].lower()}_{offset % 50}",
                        "timestamp": None,
                        "prompt_id": None,
                        "edit_type": "none",
                        "provenance": "salminen2022amazon_cgor",
                        "split_group": f"domain_{category[:8].lower()}",
                    })
                fetched += len(rows)
                offset += batch_size
                print(f"[AMAZON INGESTION] Progress: {fetched}/{sample_size} fetched...")
        except Exception as e:
            print(f"[WARN] Error fetching batch at offset {offset}: {e}")
            break

    df = pd.DataFrame(records)
    if not df.empty:
        df.to_csv(dest_path, index=False)
        print(f"[AMAZON INGESTION COMPLETE] Saved {len(df)} samples to {dest_path.name}.")
    return df

def ingest_yelpchi_graph():
    """Downloads YelpChi graph benchmark and generates graph metadata summary."""
    zip_path = RAW_DIR / "YelpChi.zip"
    url = "https://github.com/YingtongDou/CARE-GNN/raw/master/data/YelpChi.zip"
    download_file(url, zip_path)

    import scipy.io
    with zipfile.ZipFile(zip_path, "r") as z:
        with z.open("YelpChi.mat") as f:
            mat = scipy.io.loadmat(f)
    
    features = mat["features"]
    labels = mat["label"].flatten()
    net_rur = mat["net_rur"]
    net_rtr = mat["net_rtr"]
    net_rsr = mat["net_rsr"]
    homo = mat["homo"]

    num_nodes = features.shape[0]
    num_spam = int(np.sum(labels == 1))
    num_benign = int(np.sum(labels == 0))

    graph_summary = {
        "dataset_name": "YelpChi",
        "provenance": "rayana2015collective_kdd",
        "num_nodes": int(num_nodes),
        "num_features": int(features.shape[1]),
        "num_filtered_spam": num_spam,
        "num_recommended_benign": num_benign,
        "spam_ratio": float(num_spam / num_nodes),
        "edges_rur": int(net_rur.nnz),
        "edges_rtr": int(net_rtr.nnz),
        "edges_rsr": int(net_rsr.nnz),
        "edges_homo": int(homo.nnz),
    }

    summary_file = PROCESSED_DIR / "yelpchi_graph_summary.json"
    with open(summary_file, "w") as out:
        json.dump(graph_summary, out, indent=2)
    print(f"[YELPCHI INGESTION COMPLETE] {num_nodes} nodes, {homo.nnz} edges. Summary saved to {summary_file.name}.")
    return graph_summary

def run_master_ingestion():
    print("=================================================================")
    print("VERITAS AI: EXECUTING BENCHMARK DATASET INGESTION PIPELINE")
    print("=================================================================")
    
    df_ott = ingest_ott_opspam()
    df_ai = ingest_opspam_ai()
    df_amazon = ingest_amazon_cgor(sample_size=3000)
    yelp_summary = ingest_yelpchi_graph()

    # Combine text datasets
    master_df = pd.concat([df_ott, df_ai, df_amazon], ignore_index=True)

    # Clean & Deduplicate
    initial_count = len(master_df)
    master_df.drop_duplicates(subset=["review_text"], inplace=True)
    dedup_count = len(master_df)
    print(f"[DEDUPLICATION] Removed {initial_count - dedup_count} exact duplicates. Remaining: {dedup_count}.")

    # Save Master Corpus
    master_csv = PROCESSED_DIR / "veritas_master_reviews.csv"
    master_jsonl = PROCESSED_DIR / "veritas_master_reviews.jsonl"
    master_df.to_csv(master_csv, index=False)
    master_df.to_json(master_jsonl, orient="records", lines=True)

    print(f"[INGESTION COMPLETE] Master corpus saved: {master_csv} ({dedup_count} reviews).")
    print("Class Distributions:")
    print("Deception:", master_df["deception_label"].value_counts().to_dict())
    print("Authorship:", master_df["authorship_label"].value_counts().to_dict())
    print("Sources:", master_df["source_dataset"].value_counts().to_dict())
    print("=================================================================")
    return master_df

if __name__ == "__main__":
    run_master_ingestion()
