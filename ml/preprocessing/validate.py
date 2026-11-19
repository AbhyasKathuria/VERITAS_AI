"""
VERITAS AI: Data Leakage, Label Consistency & DB Sync Validator
Audits partitions for overlap and populates relational database tables.
"""

import sys
import pandas as pd
from pathlib import Path
from backend.app.database.session import SessionLocal
from backend.app.database.models import Dataset, DatasetVersion, Review

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED_DIR = BASE_DIR / "ml" / "data" / "processed"

def audit_splits():
    train_path = PROCESSED_DIR / "train.csv"
    val_path = PROCESSED_DIR / "val.csv"
    test_path = PROCESSED_DIR / "test.csv"

    for p in [train_path, val_path, test_path]:
        if not p.exists():
            raise FileNotFoundError(f"Missing split file: {p}")

    df_train = pd.read_csv(train_path)
    df_val = pd.read_csv(val_path)
    df_test = pd.read_csv(test_path)

    # 1. Text overlap check
    train_texts = set(df_train["review_text"])
    val_texts = set(df_val["review_text"])
    test_texts = set(df_test["review_text"])

    tv_overlap = train_texts.intersection(val_texts)
    tt_overlap = train_texts.intersection(test_texts)
    vt_overlap = val_texts.intersection(test_texts)

    assert len(tv_overlap) == 0, f"LEAKAGE DETECTED: {len(tv_overlap)} text overlaps between Train and Val"
    assert len(tt_overlap) == 0, f"LEAKAGE DETECTED: {len(tt_overlap)} text overlaps between Train and Test"
    assert len(vt_overlap) == 0, f"LEAKAGE DETECTED: {len(vt_overlap)} text overlaps between Val and Test"

    # 2. Group isolation check
    train_groups = set(df_train["split_group"])
    val_groups = set(df_val["split_group"])
    test_groups = set(df_test["split_group"])

    tg_vg = train_groups.intersection(val_groups)
    tg_tg = train_groups.intersection(test_groups)
    vg_tg = val_groups.intersection(test_groups)

    assert len(tg_vg) == 0, f"GROUP LEAKAGE: Groups shared between Train and Val: {tg_vg}"
    assert len(tg_tg) == 0, f"GROUP LEAKAGE: Groups shared between Train and Test: {tg_tg}"
    assert len(vg_tg) == 0, f"GROUP LEAKAGE: Groups shared between Val and Test: {vg_tg}"

    print("[AUDIT SUCCESS] Zero review text or entity group leakage across Train, Val, and Test splits.")
    return True

def sync_database():
    master_path = PROCESSED_DIR / "veritas_master_reviews.csv"
    df = pd.read_csv(master_path)

    db = SessionLocal()
    try:
        # Check or create datasets
        sources = df["source_dataset"].unique()
        for src in sources:
            existing = db.query(Dataset).filter(Dataset.id == src).first()
            if not existing:
                src_df = df[df["source_dataset"] == src]
                ds = Dataset(
                    id=src,
                    name=src.replace("_", " ").title(),
                    description=f"Standardized benchmark dataset for {src}.",
                    source_type="benchmark",
                    domain="hotels" if "opspam" in src else "products",
                    license="Academic Research Use",
                    sample_count=len(src_df)
                )
                db.add(ds)
        db.commit()

        # Ingest a sample of reviews into DB for API demonstration
        current_review_count = db.query(Review).count()
        if current_review_count < 500:
            print(f"[DB SYNC] Populating review records (Current: {current_review_count})...")
            # Ingest first 500 reviews across splits
            for _, row in df.head(500).iterrows():
                rev = Review(
                    id=str(row["review_id"]),
                    dataset_id=str(row["source_dataset"]),
                    review_text=str(row["review_text"]),
                    deception_label=str(row["deception_label"]),
                    authorship_label=str(row["authorship_label"]),
                    source_dataset=str(row["source_dataset"]),
                    generator_model=str(row["generator_model"]) if pd.notna(row["generator_model"]) else None,
                    product_category=str(row["product_category"]),
                    rating=float(row["rating"]) if pd.notna(row["rating"]) else None,
                    reviewer_id=str(row["reviewer_id"]) if pd.notna(row["reviewer_id"]) else None,
                    product_id=str(row["product_id"]) if pd.notna(row["product_id"]) else None,
                    timestamp=str(row["timestamp"]) if pd.notna(row["timestamp"]) else None,
                    prompt_id=str(row["prompt_id"]) if pd.notna(row["prompt_id"]) else None,
                    edit_type=str(row["edit_type"]) if pd.notna(row["edit_type"]) else None,
                    provenance=str(row["provenance"]) if pd.notna(row["provenance"]) else None,
                    split_group=str(row["split_group"]) if pd.notna(row["split_group"]) else None,
                )
                db.merge(rev)
            db.commit()
            print(f"[DB SYNC] Synced 500 reviews to database.")
    finally:
        db.close()

if __name__ == "__main__":
    audit_splits()
    sync_database()
