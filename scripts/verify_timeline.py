#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Fix Windows console UTF-8 output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from linear_ops import get_issues

issues = get_issues()
# Sort by dueDate
sorted_issues = sorted(issues, key=lambda x: x.get("dueDate") or "9999-99-99")
print("\n=== KESİNLEŞEN KRONOLOJİK EYLEM TAKVİMİ ===")
for iss in sorted_issues:
    assignee = iss.get("assignee", {}).get("name", "Atanmamış")
    print(f"[{iss['identifier']}] {iss['title']}")
    print(f"       Teslim Tarihi : {iss.get('dueDate')}")
    print(f"       Sorumlu       : {assignee}")
    print(f"       Durum         : {iss.get('state', {}).get('name')}")
    print()
