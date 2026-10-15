#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from linear_ops import graphql

res = graphql("""
query {
  __type(name: "DocumentCreateInput") {
    inputFields {
      name
      type {
        name
        kind
      }
    }
  }
}
""")
fields = res.get("__type", {}).get("inputFields", [])
print("DocumentCreateInput fields:", [(f["name"], f["type"]) for f in fields])
