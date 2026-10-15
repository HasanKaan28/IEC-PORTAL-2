#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from linear_ops import graphql

res = graphql("""
mutation {
  issueUpdate(id: "acbb6c70-745f-4453-a738-8cf115968bb6", input: { sortOrder: -5000.0 }) {
    success
    issue {
      identifier
      sortOrder
    }
  }
}
""")
print(res)
