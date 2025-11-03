import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB", "healthcare")
COLL_NAME = os.getenv("MONGODB_COLLECTION", "admissions")
CSV_PATH = os.getenv("CSV_PATH", "./Data/healthcare_dataset.csv")
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "5000"))
