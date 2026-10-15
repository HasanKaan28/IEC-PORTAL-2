#!/usr/bin/env python3
"""
Sync all Linear entities (Team name, Documents, and Issue descriptions)
with the new official club name: IUS Engineering Club (IEC).
"""

import sys
import re
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT / "scripts"))

from linear_ops import graphql

REPLACEMENTS = [
    (r"IUS Engineering Events Club \(IEEC\)", "IUS Engineering Club (IEC)"),
    (r"IUS ENGINEERING EVENTS CLUB \(IEEC\)", "IUS ENGINEERING CLUB (IEC)"),
    (r"IUS Engineering Events Club", "IUS Engineering Club"),
    (r"IUS ENGINEERING EVENTS CLUB", "IUS ENGINEERING CLUB"),
    (r"Engineering Events Club", "Engineering Club"),
    (r"ENGINEERING EVENTS CLUB", "ENGINEERING CLUB"),
    (r"Klub za inženjerske događaje IUS", "Inženjerski klub IUS"),
    (r"IUS Mühendislik Etkinlikleri Kulübü", "IUS Mühendislik Kulübü"),
    (r"Mühendislik Etkinlikleri Kulübü", "Mühendislik Kulübü"),
    (r"\bIEEC\b", "IEC"),
]

def rebrand_text(text):
    if not text:
        return text

    # Protect URLs that have ius-engineering-events slug
    url_placeholders = {}
    def url_sub(match):
        idx = len(url_placeholders)
        key = f"__PROTECTED_URL_{idx}__"
        url_placeholders[key] = match.group(0)
        return key

    protected = re.sub(r'https?://[^\s)\]">]+', url_sub, text)
    protected = re.sub(r'[\w\\/.-]*ius-engineering-events[\w\\/.-]*', url_sub, protected)

    res = protected
    for pattern, rep in REPLACEMENTS:
        res = re.sub(pattern, rep, res)

    for key, original in url_placeholders.items():
        res = res.replace(key, original)

    return res

def read_file(rel_path):
    p = WORKSPACE_ROOT / rel_path
    with open(p, "r", encoding="utf-8") as f:
        return f.read()

def sync_team():
    print("--- 1. TEAM NAME UPDATE ---")
    m = """
    mutation UpdateTeam($id: String!, $input: TeamUpdateInput!) {
      teamUpdate(id: $id, input: $input) {
        success
        team { id name key }
      }
    }
    """
    try:
        res = graphql(m, {
            "id": "950833ee-0897-4368-9087-60d73806e09b",
            "input": {"name": "IUS Engineering Club"}
        })
        print(f"[✓] Linear Takım İsmi Güncellendi: {res.get('teamUpdate', {}).get('team', {}).get('name')}")
    except Exception as e:
        print(f"[!] Team güncelleme uyarısı: {e}")

def sync_documents():
    print("\n--- 2. LINEAR DOCUMENTS UPDATE ---")
    doc_mutation = """
    mutation UpdateDoc($id: String!, $input: DocumentUpdateInput!) {
      documentUpdate(id: $id, input: $input) {
        success
        document { id title slugId }
      }
    }
    """
    docs_to_sync = [
        ("24e233dd-44ba-4c96-b391-1dcb7da6d020", "IEC Official Club Constitution", "constitution/CONSTITUTION.md"),
        ("8be26629-83d3-4c7a-a7a0-66ebb1f51480", "SCC Executive Board & Founding Members Roster (2026/2027)", "templates/SCC_FOUNDING_10_MEMBERS.md"),
        ("02003d18-aaaa-4236-a983-abff05a1b4e4", "SCC Proposed Annual Budget Estimate (1,300 BAM - Balanced & Realistic)", "templates/SCC_DRAFT_BUDGET.md"),
        ("399ef8e6-d063-4624-95db-dc7d1a476d68", "SCC Proposed Annual Activity Plan (4 Core Pillars & DevHack 2026/2027)", "templates/SCC_ANNUAL_ACTIVITY_PLAN.md"),
        ("86248b5d-ea1e-4447-b9f1-36d418d02ac9", "FENS Akademik Danışman Resmi Davet Mektubu", "templates/ACADEMIC_ADVISOR_INVITATION.md"),
    ]

    for doc_id, title, rel_path in docs_to_sync:
        content = read_file(rel_path)
        try:
            res = graphql(doc_mutation, {
                "id": doc_id,
                "input": {
                    "title": title,
                    "content": content
                }
            })
            success = res.get("documentUpdate", {}).get("success")
            print(f"[✓] Doküman Güncellendi ({title}): success={success}")
        except Exception as e:
            print(f"[!] Doküman güncelleme hatası ({title}): {e}")

def sync_issues():
    print("\n--- 3. LINEAR ISSUES UPDATE ---")
    query = """
    query {
      issues {
        nodes {
          id
          identifier
          title
          description
        }
      }
    }
    """
    res = graphql(query)
    issues = res.get("issues", {}).get("nodes", [])
    
    update_mut = """
    mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue { id identifier title }
      }
    }
    """

    for iss in issues:
        iid = iss["id"]
        ident = iss["identifier"]
        old_title = iss["title"]
        old_desc = iss.get("description") or ""

        new_title = rebrand_text(old_title)
        new_desc = rebrand_text(old_desc)

        if new_title != old_title or new_desc != old_desc:
            print(f"[*] {ident} güncelleniyor...")
            inp = {}
            if new_title != old_title:
                inp["title"] = new_title
            if new_desc != old_desc:
                inp["description"] = new_desc

            try:
                up_res = graphql(update_mut, {"id": iid, "input": inp})
                success = up_res.get("issueUpdate", {}).get("success")
                print(f"    [✓] {ident} başarıyla güncellendi (success={success})")
            except Exception as e:
                print(f"    [!] {ident} güncelleme hatası: {e}")
        else:
            print(f"[-] {ident} zaten güncel.")

def main():
    sync_team()
    sync_documents()
    sync_issues()
    print("\n[✓] TÜM LINEAR VERİLERİ BAŞARIYLA IUS ENGINEERING CLUB (IEC) OLARAK GÜNCELLENDİ!")

if __name__ == "__main__":
    main()
