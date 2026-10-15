#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from linear_ops import graphql

q = """
query {
  issues {
    nodes {
      id
      identifier
      title
      priority
      sortOrder
      dueDate
      state {
        name
        type
      }
    }
  }
}
"""
res = graphql(q)
for issue in res.get("issues", {}).get("nodes", []):
    print(f"[{issue['identifier']}] State: {issue['state']['name']}, Priority: {issue['priority']}, Due: {issue['dueDate']}, SortOrder: {issue['sortOrder']}, Title: {issue['title']}")
