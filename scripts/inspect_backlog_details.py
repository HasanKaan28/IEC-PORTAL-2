#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from linear_ops import graphql

q = """
query {
  issues(filter: { state: { name: { eq: "Backlog" } } }) {
    nodes {
      id
      identifier
      title
      priority
      sortOrder
      subIssueSortOrder
      createdAt
      updatedAt
      dueDate
    }
  }
}
"""
res = graphql(q)
for iss in res.get("issues", {}).get("nodes", []):
    print(iss)
