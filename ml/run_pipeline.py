"""
CareerCompass — Complete ML Dataset Preparation Pipeline Runner (Phase 3.1)
Executes all auditing, label normalization, leakage prevention, splitting,
feature engineering, and reproducible artifact generation.
ZERO MODELS ARE TRAINED IN THIS PIPELINE.
"""

import sys
from pathlib import Path
import json
import pandas as pd

# Add ml root to path
ml_root = Path(__file__).resolve().parent
if str(ml_root) not in sys.path:
    sys.path.insert(0, str(ml_root))

from src.utils.reproducibility import set_seed, load_config, get_base_dir, get_environment_info
from src.data.load_data import load_all_raw
from src.data.validate_data import (
    audit_dataframe,
    generate_primary_report,
    generate_external_report,
    generate_riasec_report,
)
from src.features.skill_features import build_skill_vocabulary_report
from src.features.build_features import (
    build_primary_features,
    build_external_features,
    build_riasec_features,
)
from src.data.split_data import split_primary_dataset, save_primary_splits
from src.preprocessing.pipeline import PrimaryPreprocessor


def run_pipeline() -> None:
    print("=" * 80)
    print("CAREERCOMPASS — PHASE 3.1 DATASET PREPARATION PIPELINE")
    print("=" * 80)

    # 1. Load configuration and initialize seed
    config = load_config()
    set_seed(config["reproducibility"]["random_seed"])
    base_dir = get_base_dir()

    env_info = get_environment_info()
    print(f"Environment: Python {env_info['python_version']}, OS: {env_info['os']}")
    print(f"Random seed set to: {config['reproducibility']['random_seed']}")

    # Create destination directories
    reports_dir = base_dir / config["paths"]["reports_dir"]
    reports_dir.mkdir(parents=True, exist_ok=True)
    primary_proc_dir = base_dir / config["paths"]["processed_dir"] / "primary"
    primary_proc_dir.mkdir(parents=True, exist_ok=True)
    external_proc_dir = base_dir / config["paths"]["processed_dir"] / "external"
    external_proc_dir.mkdir(parents=True, exist_ok=True)
    riasec_proc_dir = base_dir / config["paths"]["processed_dir"] / "riasec"
    riasec_proc_dir.mkdir(parents=True, exist_ok=True)

    # 2. Load Raw Datasets
    print("\n[Step 1/6] Loading Raw Datasets...")
    df_primary_raw, df_external_raw, df_riasec_raw = load_all_raw(config)
    print(f"  - Primary Raw (Divya Eldho):     {df_primary_raw.shape[0]} rows x {df_primary_raw.shape[1]} columns")
    print(f"  - External Raw (Breejesh Dhar):   {df_external_raw.shape[0]} rows x {df_external_raw.shape[1]} columns")
    print(f"  - RIASEC Raw (Venkatesh Kumar):   {df_riasec_raw.shape[0]} rows x {df_riasec_raw.shape[1]} columns")

    # Audit raw datasets
    audit_primary_raw = audit_dataframe(df_primary_raw, config["primary_dataset"]["target_column"], "Divya_Eldho_Raw")
    audit_external_raw = audit_dataframe(df_external_raw, config["external_dataset"]["target_column"], "Breejesh_Dhar_Raw")
    audit_riasec_raw = audit_dataframe(df_riasec_raw, config["riasec_dataset"]["target_column"], "RIASEC_Benchmark_Raw")

    # 3. Primary Dataset Feature Building & Label Normalization
    print("\n[Step 2/6] Normalizing Primary Dataset & Purging Leakage...")
    df_primary_clean, primary_mapping_df = build_primary_features(df_primary_raw, config)
    print(f"  - Purged column: {config['primary_dataset']['excluded_columns']}")
    print(f"  - Raw careers mapped into 5 canonical tracks: {len(df_primary_clean)} technical rows retained")

    # Save primary label mapping CSV
    primary_mapping_path = reports_dir / "primary_label_mapping.csv"
    primary_mapping_df.to_csv(primary_mapping_path, index=False)
    print(f"  - Saved primary label mapping: {primary_mapping_path}")

    # Build primary skill vocabulary report
    _, primary_vocab_df = build_skill_vocabulary_report(df_primary_clean, skill_col="Skills")
    primary_feature_report_path = reports_dir / "primary_feature_report.csv"
    primary_vocab_df.to_csv(primary_feature_report_path, index=False)
    print(f"  - Saved skill vocabulary report ({len(primary_vocab_df)} skills): {primary_feature_report_path}")

    # Audit cleaned primary dataset
    audit_primary_clean = audit_dataframe(
        df_primary_clean,
        config["primary_dataset"]["canonical_target_column"],
        "Divya_Eldho_Clean_Technical"
    )
    generate_primary_report(audit_primary_raw, audit_primary_clean, config, reports_dir / "primary_dataset_report.md")
    print(f"  - Saved primary audit report: {reports_dir / 'primary_dataset_report.md'}")

    # Save interim cleaned primary dataset
    interim_primary_path = base_dir / config["paths"]["interim_dir"] / "primary_cleaned.csv"
    interim_primary_path.parent.mkdir(parents=True, exist_ok=True)
    df_primary_clean.to_csv(interim_primary_path, index=False)

    # 4. Stratified Train/Test Split (BEFORE PREPROCESSING)
    print("\n[Step 3/6] Performing 80/20 Stratified Train/Test Split (Pre-Transformation)...")
    train_df, test_df, split_metadata = split_primary_dataset(df_primary_clean, config)
    save_primary_splits(train_df, test_df, split_metadata, primary_proc_dir)
    print(f"  - Train set size: {len(train_df)} ({len(train_df)/len(df_primary_clean)*100:.1f}%)")
    print(f"  - Test set size:  {len(test_df)} ({len(test_df)/len(df_primary_clean)*100:.1f}%)")
    print("  - Train class distribution:")
    for cls_name, cnt in split_metadata["train_class_counts"].items():
        print(f"      {cls_name:40s}: {cnt:3d} train | {split_metadata['test_class_counts'].get(cls_name, 0):2d} test")

    # 5. Fit Preprocessing Pipeline ONLY on Train Set
    print("\n[Step 4/6] Fitting Preprocessing Pipeline on Training Data (Zero Leakage)...")
    preprocessor = PrimaryPreprocessor(
        cat_cols=config["primary_dataset"]["features"]["categorical"],
        skill_col="Skills"
    )
    X_train_proc = preprocessor.fit_transform(train_df)
    X_test_proc = preprocessor.transform(test_df)

    # Attach canonical target to processed sets
    target_col = config["primary_dataset"]["canonical_target_column"]
    X_train_proc[target_col] = train_df[target_col].values
    X_test_proc[target_col] = test_df[target_col].values

    # Save processed train and test matrices
    X_train_proc.to_csv(primary_proc_dir / "train_processed.csv", index=False)
    X_test_proc.to_csv(primary_proc_dir / "test_processed.csv", index=False)

    # Save feature metadata
    meta = preprocessor.get_metadata()
    meta["split_metadata"] = split_metadata
    with open(primary_proc_dir / "feature_metadata.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print(f"  - Engineered features count: {meta['n_features']}")
    print(f"  - Saved feature metadata: {primary_proc_dir / 'feature_metadata.json'}")

    # 6. External Transfer Dataset Preparation
    print("\n[Step 5/6] Preparing External Transfer Dataset (Breejesh Dhar)...")
    df_ext_clean, ext_mapping_df = build_external_features(df_external_raw, config)
    ext_mapping_path = reports_dir / "external_label_mapping.csv"
    ext_mapping_df.to_csv(ext_mapping_path, index=False)
    print(f"  - Saved external mapping table: {ext_mapping_path}")

    audit_external_clean = audit_dataframe(
        df_ext_clean,
        config["external_dataset"]["canonical_target_column"],
        "Breejesh_Dhar_Clean_Technical"
    )
    generate_external_report(audit_external_raw, audit_external_clean, config, reports_dir / "external_dataset_report.md")
    df_ext_clean.to_csv(external_proc_dir / "breejesh_transfer_eval.csv", index=False)
    print(f"  - Retained external transfer records: {len(df_ext_clean)} graduates across 5 canonical tracks")
    print(f"  - Saved external evaluation dataset: {external_proc_dir / 'breejesh_transfer_eval.csv'}")

    # 7. RIASEC Benchmark Dataset Preparation
    print("\n[Step 6/6] Preparing RIASEC Benchmark Configurations (A & B)...")
    df_riasec_a, df_riasec_b, y_riasec = build_riasec_features(df_riasec_raw, config)
    generate_riasec_report(audit_riasec_raw, config, reports_dir / "riasec_dataset_report.md")

    # Save processed RIASEC configs
    df_riasec_a[config["riasec_dataset"]["target_column"]] = y_riasec
    df_riasec_b[config["riasec_dataset"]["target_column"]] = y_riasec
    df_riasec_a.to_csv(riasec_proc_dir / "riasec_config_a.csv", index=False)
    df_riasec_b.to_csv(riasec_proc_dir / "riasec_config_b.csv", index=False)
    print(f"  - Config A (Cognitive/Aptitude): {df_riasec_a.shape[1]-1} features x {len(df_riasec_a)} rows")
    print(f"  - Config B (Full Psychometric):  {df_riasec_b.shape[1]-1} features x {len(df_riasec_b)} rows")
    print(f"  - Saved RIASEC benchmark report: {reports_dir / 'riasec_dataset_report.md'}")

    print("\n" + "=" * 80)
    print("PIPELINE COMPLETED SUCCESSFULLY. ZERO CLASSIFIERS WERE TRAINED.")
    print("=" * 80)


if __name__ == "__main__":
    run_pipeline()
