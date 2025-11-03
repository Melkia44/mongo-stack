import pandas as pd

EXPECTED_COLUMNS = [
    "Name","Age","Gender","Blood Type","Medical Condition","Date of Admission",
    "Doctor","Hospital","Insurance Provider","Billing Amount","Room Number",
    "Admission Type","Discharge Date","Medication","Test Results"
]

VALID_BLOOD = {"A+","A-","B+","B-","AB+","AB-","O+","O-"}
VALID_GENDER = {"Male","Female","Other"}

def validate_columns(df: pd.DataFrame):
    missing = [c for c in EXPECTED_COLUMNS if c not in df.columns]
    extra = [c for c in df.columns if c not in EXPECTED_COLUMNS]
    return {"missing": missing, "extra": extra}

def coerce_and_validate_types(df: pd.DataFrame) -> pd.DataFrame:
    for c in ["Date of Admission", "Discharge Date"]:
        df[c] = pd.to_datetime(df[c], errors="coerce")
    df["Age"] = pd.to_numeric(df["Age"], errors="coerce")
    df["Billing Amount"] = pd.to_numeric(df["Billing Amount"], errors="coerce")
    df["Room Number"] = pd.to_numeric(df["Room Number"], errors="coerce")
    return df

def standardize_strings(df: pd.DataFrame) -> pd.DataFrame:
    for c in ["Name","Doctor","Hospital","Insurance Provider","Medication","Medical Condition"]:
        df[c] = df[c].astype(str).str.strip().str.title()
    mapping = {"M": "Male", "F": "Female", "Male": "Male", "Female": "Female", "Other": "Other"}
    df["Gender"] = df["Gender"].astype(str).str.strip().str.title().map(mapping).fillna("Other")
    df["Blood Type"] = df["Blood Type"].astype(str).str.strip().str.upper()
    return df

def data_quality_report(df: pd.DataFrame) -> dict:
    rep = {
        "row_count": int(len(df)),
        "null_counts": df.isna().sum().to_dict(),
        "duplicate_rows": int(df.duplicated().sum()),
    }
    invalid = {
        "age_out_of_range": int(((df["Age"] < 0) | (df["Age"] > 120)).fillna(True).sum()),
        "billing_negative": int((df["Billing Amount"] < 0).fillna(True).sum()),
        "room_negative": int((df["Room Number"] < 0).fillna(True).sum()),
        "invalid_blood": int((~df["Blood Type"].isin(list(VALID_BLOOD))).sum()),
        "invalid_gender": int((~df["Gender"].isin(list(VALID_GENDER))).sum()),
    }
    rep["invalid_rules"] = invalid
    return rep

def drop_bad_rows(df: pd.DataFrame) -> pd.DataFrame:
    mask = (
        df["Age"].between(0, 120, inclusive="both") &
        (df["Billing Amount"] >= 0) &
        (df["Room Number"] >= 0) &
        (df["Blood Type"].isin(VALID_BLOOD)) &
        (df["Gender"].isin(VALID_GENDER))
    )
    return df[mask].copy()
