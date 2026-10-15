#!/usr/bin/env python3
"""
Update Linear task IUS-7 and Document 8be26629-83d3-4c7a-a7a0-66ebb1f51480
with Bakir Bašić as the PR & Media Lead (Completing 5/5 Management Board).
"""

import sys
from pathlib import Path

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT / "scripts"))

from linear_ops import graphql

# 1. Update Document: SCC Executive Board & Founding Members Roster
doc_path = WORKSPACE_ROOT / "templates" / "SCC_FOUNDING_10_MEMBERS.md"
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

doc_mutation = """
mutation UpdateDoc($id: String!, $input: DocumentUpdateInput!) {
  documentUpdate(id: $id, input: $input) {
    success
    document { id title }
  }
}
"""
res_doc = graphql(doc_mutation, {
    "id": "8be26629-83d3-4c7a-a7a0-66ebb1f51480",
    "input": {
        "title": "SCC Executive Board & Founding Members Roster (5/5 Board & 10/10 Members)",
        "content": doc_content
    }
})
print(f"[✓] Linear Roster Dokümanı Güncellendi: {res_doc}")

# 2. Query Workflow states to get 'Done' state id
state_query = """
query {
  workflowStates {
    nodes {
      id
      name
      type
    }
  }
}
"""
res_states = graphql(state_query)
done_state_id = None
for s in res_states.get("workflowStates", {}).get("nodes", []):
    if s["type"] == "completed" or s["name"].lower() == "done":
        done_state_id = s["id"]
        break

# 3. Update IUS-7 Issue
desc = """### 🎯 Resmi Yönetim Kurulu Kadrosu (5/5 Tam Kadro Onaylandı):

SCC resmi kulüp yönergesi ve Form F252 uyarınca 5 kişilik yönetim kadrosu eksiksiz tamamlanmıştır:

* 👑 **Club President (Başkan):** Kaan Mete Şenyıldız (2. Sınıf, No: 250302201 - FENS)
* 🚀 **Vice President (Kurucu Ortak & Bşk. Yrd.):** Hasan Kaan Karabulut (1. Sınıf, No: 250302195 - FENS)
* 📜 **Secretary (Kurucu Ortak & Genel Sekreter):** Mahmut İhsan Avcı (1. Sınıf, No: 250302233 - FENS)
* 💰 **Treasurer (Sayman & Finans Lideri):** Bekir Enes Çokbekler (1. Sınıf, No: 250302229 - Makine Mühendisliği)
* 📣 **PR & Media Lead (Basın, Medya ve İletişim):** **Bakir Bašić** (1. Sınıf, No: 260302030 - FENS, Tel: `+387-61-533-947`)

---

### 📄 Doğrudan Açılabilir Resmi Belge:
👉 [**🔗 TIKLAYIN: SCC Yönetim Kurulu ve 10 Kurucu Üye Listesi (Linear Dokümanı)**](https://linear.app/ius-engineering-events/document/scc-executive-board-and-founding-members-roster-20262027-f3bab5324d30)

### ✅ Durum:
5/5 Yönetim Kurulu ve 10/10 Kurucu Normal Üye listesi başarıyla %100 tamamlanmış, tüm resmi evraklara ve masaüstündeki Form F252'ye işlenmiştir.
"""

issue_mutation = """
mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
  issueUpdate(id: $id, input: $input) {
    success
    issue { id identifier title state { name } }
  }
}
"""

# Query issues to find IUS-7 id
res_issues = graphql("query { issues { nodes { id identifier } } }")
ius7_id = None
for iss in res_issues.get("issues", {}).get("nodes", []):
    if iss.get("identifier") == "IUS-7":
        ius7_id = iss["id"]
        break

if ius7_id:
    inp = {
        "title": "🎉 Resmi Yönetim Kurulu Kadrosu (5/5 Tam Kadro - PR Lead: Bakir Bašić)",
        "description": desc
    }
    if done_state_id:
        inp["stateId"] = done_state_id

    res_iss = graphql(issue_mutation, {"id": ius7_id, "input": inp})
    print(f"[✓] IUS-7 Görevi Güncellendi (Tamamlandı): {res_iss}")
else:
    print("[!] IUS-7 ID bulunamadı.")
