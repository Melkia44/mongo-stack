from pymongo import MongoClient
from .config import MONGODB_URI, DB_NAME, COLL_NAME

def _coll():
    return MongoClient(MONGODB_URI)[DB_NAME][COLL_NAME]

def create_one(doc: dict):
    return _coll().insert_one(doc).inserted_id

def read_by_hospital(hospital: str, limit=5):
    return list(_coll().find({"Hospital": hospital}).limit(limit))

def update_medication_by_name(name: str, new_med: str):
    res = _coll().update_many({"Name": name}, {"$set": {"Medication": new_med}})
    return res.modified_count

def delete_by_condition(condition: str):
    res = _coll().delete_many({"Medical Condition": condition})
    return res.deleted_count
