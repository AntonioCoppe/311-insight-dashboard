#!/usr/bin/env python3
# scripts/load_requests.py

import os
import glob
import csv
import psycopg2
from psycopg2.extras import execute_values
import requests

# 1) Load DATABASE_URL from your backend/.env
from dotenv import load_dotenv
load_dotenv('src/backend/.env')

DB_URL = os.environ['DATABASE_URL']

# 2) Columns in the CSV files (in order) that map to your table
CSV_FIELDS = [
    'Creation Date',
    'Status',
    'First 3 Chars of Postal Code',
    'Intersection Street 1',
    'Intersection Street 2',
    'Ward',
    'Service Request Type',
    'Division',
    'Section',
]

# 3) Corresponding columns in your "requests" table
TABLE_COLS = [
    'created_at',
    'status',
    'postal_area',
    'street_1',
    'street_2',
    'ward',
    'request_type',
    'division',
    'section',
]

def parse_row(row):
    # row: dict from csv.DictReader
    # return a tuple matching TABLE_COLS order
    return tuple(row[field] or None for field in CSV_FIELDS)

def load_file(cursor, path):
    print(f"Loading {path} …")
    # open as latin-1 so we don’t error on accented chars
    with open(path, newline='', encoding='latin-1', errors='replace') as f:
        reader = csv.DictReader(f)
        rows = [parse_row(r) for r in reader if all(k in r for k in CSV_FIELDS)]
        sql = f"""
            INSERT INTO requests ({', '.join(TABLE_COLS)})
            VALUES %s
        """
        # batch-insert in pages of 5000
        execute_values(cursor, sql, rows, page_size=5000)

def notify_backend():
    # Trigger backend update via WebSocket
    api_url = os.environ.get('REACT_APP_API_URL', 'http://localhost:3000')
    try:
        response = requests.post(f"{api_url}/update-recent")
        if response.status_code == 200:
            print("Backend notified of update.")
        else:
            print(f"Failed to notify backend: {response.status_code}")
    except requests.RequestException as e:
        print(f"Error notifying backend: {e}")

def main():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()
    try:
        # Optionally clear existing data:
        # cur.execute("TRUNCATE requests;")

        for path in sorted(glob.glob('data/csv/SR*.csv')):
            load_file(cur, path)
            conn.commit()
            notify_backend()  # Notify backend after each file commit

        print("All files loaded!")
    except Exception as e:
        conn.rollback()
        print(f"Error occurred: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    main()