import pandas as pd
from .validators import (
    validate_columns, coerce_and_validate_types, standardize_strings,
    data_quality_report, drop_bad_rows
)

def load_csv(csv_path: str) -> pd.DataFrame:
    return pd.read_csv(csv_path)

def transform_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    check = validate_columns(df)
    if check["missing"]:
        raise ValueError(f"Missing columns: {check['missing']}")
    df = coerce_and_validate_types(df)
    df = standardize_strings(df)
    df = drop_bad_rows(df)
    df["Age"] = df["Age"].round().astype("Int64")
    df["Room Number"] = df["Room Number"].round().astype("Int64")
    return df

def dataframe_to_mongo_docs(df: pd.DataFrame):
    return df.where(pd.notnull(df), None).to_dict(orient="records")

def quality(df: pd.DataFrame) -> dict:
    return data_quality_report(df)
