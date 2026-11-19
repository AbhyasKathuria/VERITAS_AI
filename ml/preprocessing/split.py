"""
VERITAS AI: Leakage-Free Stratified Group Splitting Module
Partitions veritas_master_reviews into Train (~70%), Validation (~15%), and Test (~15%)
using GroupShuffleSplit over `product_id` to guarantee zero cross-entity leakage.
"""

import pandas as pd
from pathlib import Path
from sklearn.model_selection import GroupShuffleSplit

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED_DIR = BASE_DIR / "ml" / "data" / "processed"

def generate_splits(random_state: int = 42):
    master_path = PROCESSED_DIR / "veritas_master_reviews.csv"
    if not master_path.exists():
        raise FileNotFoundError(f"Master reviews file not found at {master_path}")

    df = pd.read_csv(master_path)
    # Ensure grouping key is fine-grained entity
    df["entity_group"] = df["product_id"].fillna(df["split_group"])

    print(f"[SPLIT] Ingesting master corpus with {len(df)} records across {df['entity_group'].nunique()} entity groups...")

    # Primary split: 70% train, 30% temp
    gss_outer = GroupShuffleSplit(n_splits=1, test_size=0.30, random_state=random_state)
    train_idx, temp_idx = next(gss_outer.split(df, groups=df["entity_group"]))

    df_train = df.iloc[train_idx].copy()
    df_temp = df.iloc[temp_idx].copy()

    # Secondary split: 50/50 on temp -> 15% val, 15% test
    gss_inner = GroupShuffleSplit(n_splits=1, test_size=0.50, random_state=random_state)
    val_idx, test_idx = next(gss_inner.split(df_temp, groups=df_temp["entity_group"]))

    df_val = df_temp.iloc[val_idx].copy()
    df_test = df_temp.iloc[test_idx].copy()

    # Save split files
    train_path = PROCESSED_DIR / "train.csv"
    val_path = PROCESSED_DIR / "val.csv"
    test_path = PROCESSED_DIR / "test.csv"

    df_train.to_csv(train_path, index=False)
    df_val.to_csv(val_path, index=False)
    df_test.to_csv(test_path, index=False)

    print("=================================================================")
    print("SPLIT GENERATION SUMMARY (GROUP-AWARE BY ENTITY):")
    print(f"Train samples: {len(df_train)} ({len(df_train)/len(df)*100:.1f}%) | Groups: {df_train['entity_group'].nunique()}")
    print(f"Val samples:   {len(df_val)}   ({len(df_val)/len(df)*100:.1f}%) | Groups: {df_val['entity_group'].nunique()}")
    print(f"Test samples:  {len(df_test)}  ({len(df_test)/len(df)*100:.1f}%) | Groups: {df_test['entity_group'].nunique()}")
    print("=================================================================")
    return df_train, df_val, df_test

if __name__ == "__main__":
    generate_splits()
