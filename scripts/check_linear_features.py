#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from linear_ops import graphql

res = graphql("""
query {
  __type(name: "Mutation") {
    fields {
      name
    }
  }
}
""")
mutations = [f["name"] for f in res.get("__type", {}).get("fields", [])]
print("Document mutations:", [m for m in mutations if "document" in m.lower()])
print("Attachment mutations:", [m for m in mutations if "attachment" in m.lower()])
print("Comment mutations:", [m for m in mutations if "comment" in m.lower()])
