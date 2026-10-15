#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from linear_ops import graphql

q = """
query {
  teams {
    nodes {
      id
      name
      key
      defaultIssueEstimate
    }
  }
  customViews {
    nodes {
      id
      name
      filterData
    }
  }
}
"""
print(graphql(q))
