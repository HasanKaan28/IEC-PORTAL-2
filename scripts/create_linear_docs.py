#!/usr/bin/env python3
"""
Create native Linear Documents for all templates attached to issues and team.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import graphql, get_issues

issues = get_issues()
issue_map = {iss["identifier"]: iss for iss in issues}
team_id = issues[0]["team"]["id"]

workspace_root = Path(__file__).resolve().parent.parent

def read_file(rel_path):
    p = workspace_root / rel_path
    if p.exists():
        with open(p, "r", encoding="utf-8") as f:
            return f.read()
    return ""

advisor_letter = read_file("templates/ACADEMIC_ADVISOR_INVITATION.md")
activity_plan = read_file("templates/SCC_ANNUAL_ACTIVITY_PLAN.md")
draft_budget = read_file("templates/SCC_DRAFT_BUDGET.md")
founding_roster = read_file("templates/SCC_FOUNDING_10_MEMBERS.md")
constitution = read_file("constitution/CONSTITUTION.md")

doc_mutation = """
mutation CreateDoc($input: DocumentCreateInput!) {
  documentCreate(input: $input) {
    success
    document {
      id
      title
      slugId
      url
    }
  }
}
"""

def create_doc(title, content, issue_id=None, team_id_arg=None):
    inp = {
        "title": title,
        "content": content
    }
    if issue_id:
        inp["issueId"] = issue_id
    elif team_id_arg:
        inp["teamId"] = team_id_arg
    else:
        inp["teamId"] = team_id

    res = graphql(doc_mutation, {"input": inp})
    doc = res.get("documentCreate", {}).get("document", {})
    print(f"[✓] Linear Dokümanı: {doc.get('title')} -> {doc.get('url')}")
    return doc

# 1. Advisor Invitation Letter attached to IUS-5
doc_advisor = create_doc(
    "FENS Akademik Danışman Resmi Davet Mektubu",
    advisor_letter,
    issue_id=issue_map.get("IUS-5", {}).get("id")
)

# 2. Activity Plan attached to IUS-6
doc_activity = create_doc(
    "SCC Yıllık Faaliyet Planı (2026/2027)",
    activity_plan,
    issue_id=issue_map.get("IUS-6", {}).get("id")
)

# 3. Draft Budget attached to IUS-6
doc_budget = create_doc(
    "SCC Taslak Yıllık Bütçe Tahmini (5.000 KM)",
    draft_budget,
    issue_id=issue_map.get("IUS-6", {}).get("id")
)

# 4. Founding Roster attached to IUS-7
doc_roster = create_doc(
    "SCC 10 Kurucu Üye ve Yönetim Kurulu Listesi",
    founding_roster,
    issue_id=issue_map.get("IUS-7", {}).get("id")
)

# 5. Constitution attached to Team
doc_const = create_doc(
    "IEC Resmi Kulüp Tüzüğü (Constitution)",
    constitution,
    team_id_arg=team_id
)
