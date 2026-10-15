#!/usr/bin/env python3
"""
Fetch live Google Form responses from Google Sheets, update local records,
refresh printable documents, and synchronize with Linear.
"""

import sys
import csv
import urllib.request
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

workspace_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(workspace_root / "scripts"))

SHEET_EXPORT_URL = "https://docs.google.com/spreadsheets/d/1pLeiQpBNSfDFPGa5IqLbSGoz0Z2Lm3Olu-mq3XZhzbQ/export?format=csv"
DATA_DIR = workspace_root / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
CSV_FILE = DATA_DIR / "form_responses.csv"

def fetch_responses():
    print(f"[*] Canlı Google Sheets yanıtları çekiliyor...")
    req = urllib.request.Request(SHEET_EXPORT_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = resp.read()
    
    with open(CSV_FILE, "wb") as f:
        f.write(data)
    print(f"[✓] Veriler başarıyla kaydedildi: {CSV_FILE} ({len(data)} bayt)")
    
    # Read rows
    with open(CSV_FILE, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)

    print("\n--- 📋 Güncel Başvuru Formu Yanıtları ---")
    print(f"Toplam Form Dolduran Sayısı: {len(rows)}")
    for idx, r in enumerate(rows, 1):
        timestamp = r[0] if len(r) > 0 else ""
        name = r[1] if len(r) > 1 else ""
        email = r[2] if len(r) > 2 else ""
        phone = r[3] if len(r) > 3 else ""
        student_id = r[4] if len(r) > 4 else ""
        dept = r[5] if len(r) > 5 else ""
        year = r[6] if len(r) > 6 else ""
        print(f"  {idx}. {name} | No: {student_id} | Bölüm: {dept} ({year}. Sınıf) | Tel: {phone} | Zaman: {timestamp}")
    print("------------------------------------------\n")
    return rows

if __name__ == "__main__":
    fetch_responses()
