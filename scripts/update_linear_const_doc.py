#!/usr/bin/env python3
"""
Update Linear Document for the Club Constitution with the authentic 12-article text.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import graphql

# Read new constitution
const_path = Path(__file__).resolve().parent.parent / "constitution" / "CONSTITUTION.md"
with open(const_path, "r", encoding="utf-8") as f:
    content = f.read()

# Query existing documents
q = """
query {
  documents {
    nodes {
      id
      title
      slugId
    }
  }
}
"""
res = graphql(q)
docs = res.get("documents", {}).get("nodes", [])
for d in docs:
    if "tüzük" in d["title"].lower() or "constitution" in d["title"].lower():
        mutation = """
        mutation UpdateDoc($id: String!, $input: DocumentUpdateInput!) {
          documentUpdate(id: $id, input: $input) {
            success
            document {
              id
              title
            }
          }
        }
        """
        graphql(mutation, {"id": d["id"], "input": {"content": content, "title": "IEC Resmi Kulüp Tüzüğü (12 Maddelik Tam Tüzük)"}})
        print(f"[✓] Linear Dokümanı Başarıyla Güncellendi: {d['title']}")
        break
