#!/usr/bin/env python3
"""
Sync updated Activity Plan and Constitution into Linear Documents.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import graphql

workspace_root = Path(__file__).resolve().parent.parent

def read_file(rel_path):
    p = workspace_root / rel_path
    with open(p, "r", encoding="utf-8") as f:
        return f.read()

const_content = read_file("constitution/CONSTITUTION.md")
plan_content = read_file("templates/SCC_ANNUAL_ACTIVITY_PLAN.md")

mutation = """
mutation UpdateDoc($id: String!, $input: DocumentUpdateInput!) {
  documentUpdate(id: $id, input: $input) {
    success
    document {
      id
      title
      slugId
    }
  }
}
"""

# Update Constitution
res1 = graphql(mutation, {
    "id": "24e233dd-44ba-4c96-b391-1dcb7da6d020",
    "input": {
        "title": "IEC Official Club Constitution",
        "content": const_content
    }
})
print(f"[✓] Tüzük Linear Dokümanı Güncellendi: {res1}")

# Update Annual Activity Plan
res2 = graphql(mutation, {
    "id": "399ef8e6-d063-4624-95db-dc7d1a476d68",
    "input": {
        "title": "SCC Proposed Annual Activity Plan (4 Core Pillars & DevHack 2026/2027)",
        "content": plan_content
    }
})
print(f"[✓] Faaliyet Planı Linear Dokümanı Güncellendi: {res2}")
