import pandas as pd
from pymongo import MongoClient
from .config import MONGODB_URI, DB_NAME, COLL_NAME

def export_all_to_csv(path="./Data/export_admissions.csv"):
    coll = MongoClient(MONGODB_URI)[DB_NAME][COLL_NAME]
    docs = list(coll.find({}, {"_id": 0}))
    pd.DataFrame(docs).to_csv(path, index=False)
    return path

def export_all_to_json(path="./Data/export_admissions.json"):
    coll = MongoClient(MONGODB_URI)[DB_NAME][COLL_NAME]
    docs = list(coll.find({}, {"_id": 0}))
    pd.DataFrame(docs).to_json(path, orient="records", force_ascii=False)
    return path
