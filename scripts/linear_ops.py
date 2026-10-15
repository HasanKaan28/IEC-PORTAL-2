#!/usr/bin/env python3
"""
IEC Linear Issue Operations Tool
Expands linear_manager.py to query, update, create, and assign tasks across the team.
"""

import sys
import json
import urllib.request
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CONFIG_FILE = Path(__file__).resolve().parent.parent / "config" / "linear_config.json"

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def graphql(query, variables=None):
    cfg = load_config()
    req = urllib.request.Request(
        "https://api.linear.app/graphql",
        data=json.dumps({"query": query, "variables": variables or {}}).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": cfg["api_key"]},
        method="POST"
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                if "errors" in res:
                    print(f"GraphQL Errors: {res['errors']}")
                    sys.exit(1)
                return res.get("data", {})
        except urllib.error.HTTPError as e:
            if e.code in (500, 502, 503, 504) and attempt < 2:
                import time
                time.sleep(1.5)
                continue
            print(f"HTTP Error: {e.code} - {e.read().decode('utf-8')}")
            sys.exit(1)

def get_users():
    q = "query { users { nodes { id name displayName email } } }"
    return graphql(q).get("users", {}).get("nodes", [])

def get_issues():
    q = """
    query {
      issues {
        nodes {
          id
          identifier
          title
          description
          priority
          dueDate
          state { id name }
          assignee { id name }
          team { id key }
        }
      }
    }
    """
    return graphql(q).get("issues", {}).get("nodes", [])

def update_issue(issue_id, input_data):
    mutation = """
    mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          identifier
          title
          assignee { name }
          priority
          state { name }
        }
      }
    }
    """
    return graphql(mutation, {"id": issue_id, "input": input_data})

def create_issue(team_id, title, desc, assignee_id=None, priority=1):
    mutation = """
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          identifier
          title
          assignee { name }
          url
        }
      }
    }
    """
    inp = {
        "teamId": team_id,
        "title": title,
        "description": desc,
        "priority": priority
    }
    if assignee_id:
        inp["assigneeId"] = assignee_id
    return graphql(mutation, {"input": inp})

if __name__ == "__main__":
    users = get_users()
    issues = get_issues()
    print("Mevcut Görevler:")
    for iss in issues:
        assignee_name = iss.get("assignee", {}).get("name") if iss.get("assignee") else "Atanmamış"
        print(f"[{iss['identifier']}] {iss['title']} -> {assignee_name}")
