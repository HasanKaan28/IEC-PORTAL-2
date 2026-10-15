#!/usr/bin/env python3
"""
IEC Linear Management Bridge
Allows Antigravity IDE to directly interact with Linear.app (GraphQL API).
Uses Python standard library (urllib) - zero external dependencies required.
"""

import os
import sys
import json
import urllib.request
import urllib.parse
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
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "api_key": os.environ.get("LINEAR_API_KEY", ""),
        "default_team_id": os.environ.get("LINEAR_DEFAULT_TEAM_ID", "")
    }

def save_config(config):
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)

def linear_graphql(query, variables=None):
    cfg = load_config()
    api_key = cfg.get("api_key")
    if not api_key:
        print("[!] Linear API Key henüz tanımlanmamış.")
        print("    Lütfen Linear Settings > Security & Access > Personal API Keys sayfasından aldığınız anahtarı ekleyin:")
        print("    python scripts/linear_manager.py configure <API_KEY>")
        sys.exit(1)

    url = "https://api.linear.app/graphql"
    payload = json.dumps({"query": query, "variables": variables or {}}).encode("utf-8")
    
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": api_key
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if "errors" in data:
                print(f"[!] Linear GraphQL Hatası: {data['errors']}")
                sys.exit(1)
            return data.get("data", {})
    except urllib.error.HTTPError as e:
        print(f"[!] HTTP Hatası ({e.code}): {e.read().decode('utf-8')}")
        sys.exit(1)

def get_teams():
    query = """
    query {
      teams {
        nodes {
          id
          name
          key
        }
      }
    }
    """
    res = linear_graphql(query)
    return res.get("teams", {}).get("nodes", [])

def get_members():
    query = """
    query {
      users {
        nodes {
          id
          name
          displayName
          email
        }
      }
    }
    """
    res = linear_graphql(query)
    return res.get("users", {}).get("nodes", [])

def get_team_states(team_id):
    query = """
    query($teamId: String!) {
      team(id: $teamId) {
        states {
          nodes {
            id
            name
            type
          }
        }
      }
    }
    """
    res = linear_graphql(query, {"teamId": team_id})
    return res.get("team", {}).get("states", {}).get("nodes", [])

def create_issue(title, description="", team_key=None, assignee_name=None, priority=0, due_date=None):
    teams = get_teams()
    if not teams:
        print("[!] Linear hesabınızda hiç takım bulunamadı. Lütfen Linear üzerinden bir takım oluşturun.")
        return

    target_team = None
    if team_key:
        for t in teams:
            if t["key"].lower() == team_key.lower() or t["name"].lower() == team_key.lower():
                target_team = t
                break
    if not target_team:
        target_team = teams[0]

    input_data = {
        "title": title,
        "description": description,
        "teamId": target_team["id"],
        "priority": int(priority)
    }

    if due_date:
        input_data["dueDate"] = due_date

    if assignee_name:
        members = get_members()
        matched = None
        for m in members:
            name = m.get("name", "").lower()
            dname = m.get("displayName", "").lower()
            email = m.get("email", "").lower()
            if assignee_name.lower() in name or assignee_name.lower() in dname or assignee_name.lower() in email:
                matched = m
                break
        if matched:
            input_data["assigneeId"] = matched["id"]
            print(f"[+] Görev '{matched['name']}' ({matched.get('email', '')}) kullanıcısına atandı.")
        else:
            print(f"[?] '{assignee_name}' kullanıcısı Linear'da bulunamadı, atamasız oluşturuluyor.")

    mutation = """
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
          url
          state {
            name
          }
        }
      }
    }
    """
    res = linear_graphql(mutation, {"input": input_data})
    issue = res.get("issueCreate", {}).get("issue", {})
    print(f"\n[✓] GÖREV OLUŞTURULDU!")
    print(f"    Kod    : {issue.get('identifier')}")
    print(f"    Başlık : {issue.get('title')}")
    print(f"    Durum  : {issue.get('state', {}).get('name')}")
    print(f"    Link   : {issue.get('url')}\n")
    return issue

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print("IEC Linear Yöneticisi")
        print("Kullanım:")
        print("  python scripts/linear_manager.py configure <API_KEY>")
        print("  python scripts/linear_manager.py list-teams")
        print("  python scripts/linear_manager.py list-members")
        print("  python scripts/linear_manager.py add-task --title <BAŞLIK> [--desc <AÇIKLAMA>] [--assignee <KİŞİ>] [--team <TAKIM_KODU>] [--due <YYYY-MM-DD>] [--priority <1-4>]")
        sys.exit(0)

    cmd = args[0]
    if cmd == "configure" and len(args) >= 2:
        cfg = load_config()
        cfg["api_key"] = args[1]
        save_config(cfg)
        print("[✓] Linear API Anahtarı kaydedildi!")
    elif cmd == "list-teams":
        teams = get_teams()
        print("\n--- LINEAR TAKIMLARI ---")
        for t in teams:
            print(f" • [{t['key']}] {t['name']} (ID: {t['id']})")
    elif cmd == "list-members":
        members = get_members()
        print("\n--- LINEAR ÜYELERİ ---")
        for m in members:
            print(f" • {m['name']} (@{m.get('displayName', '')}) - {m.get('email', '')}")
    elif cmd == "add-task":
        title = "Yeni Görev"
        desc = ""
        team_key = None
        assignee = None
        priority = 0
        due = None
        for i, a in enumerate(args):
            if a == "--title" and i + 1 < len(args): title = args[i+1]
            if a == "--desc" and i + 1 < len(args): desc = args[i+1]
            if a == "--team" and i + 1 < len(args): team_key = args[i+1]
            if a == "--assignee" and i + 1 < len(args): assignee = args[i+1]
            if a == "--priority" and i + 1 < len(args): priority = args[i+1]
            if a == "--due" and i + 1 < len(args): due = args[i+1]
        create_issue(title, desc, team_key, assignee, priority, due)
