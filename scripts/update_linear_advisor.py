#!/usr/bin/env python3
"""
Update Linear task IUS-5 and associated Advisor Document
reflecting that Prof. Dr. Leila Miller is officially confirmed as Academic Advisor
and only her single physical signature is needed on Form F252 (scheduled for Tuesday 11:50).
"""

import sys
import json
from pathlib import Path

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT / "scripts"))

from linear_ops import graphql, get_issues

# 1. Query Workflow states to get 'Done' state id
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

print(f"[+] Done State ID: {done_state_id}")

# 2. Get IUS-5 issue
issues = get_issues()
ius5 = next((i for i in issues if i["identifier"] == "IUS-5"), None)
if not ius5:
    print("[-] IUS-5 not found!")
    sys.exit(1)

issue_id = ius5["id"]
print(f"[+] Found IUS-5: {issue_id}")

# 3. Prepare detailed description
description = """### 🎯 Danışman Resmi Olarak Belirlendi: Prof. Dr. Leila Miller

FENS fakültemizden resmi kulüp akademik danışmanı olarak **Prof. Dr. Leila Miller (Full Professor Dr.)** ile kesin olarak anlaşılmıştır.

### 📋 Danışman Detayları & İletişim:
- **Akademik Unvan:** Full Professor Dr., Faculty of Engineering and Natural Sciences (FENS)
- **E-posta:** `lmiller@ius.edu.ba`
- **Telefon:** `033 957 -`
- **Asistan:** Ilma Papić (`itarhanis-papic@ius.edu.ba`)

### ⚡ Yapılan İşlemler & İmza Protokolü:
- [x] **Hoca Seçimi & Onay:** Prof. Dr. Leila Miller kulübümüzün resmi Faculty Advisor'ı oldu.
- [x] **Resmi Başvuru Formu (Form F252):** Masaüstündeki başvuru formunda Tablo 1'e hoca bilgileri eksiksiz işlendi.
- [ ] **Tek Islak İmza (Fiziki):** Salı günü (13 Ekim 2026) saat 11:50'de MATH101 Calculus dersi bitiminde A F2.14 amfisinde veya odasında hocamızdan **tek ıslak imzası** alınacak.

---

### 📄 İlgili Belgeler & Bağlantılar:
👉 [**🔗 FENS Akademik Danışman Resmi Davet Mektubu (Linear Doc)**](<https://linear.app/ius-engineering-events/document/fens-akademik-danisman-resmi-davet-mektubu-8432eded09a6>)
👉 [**📋 İmza Toplama & Ders Programı Eylem Planı (SIGNATURE_COLLECTION_PLAN.md)**](<https://github.com/HasanKaan28/ius-engineering-events/blob/main/roadmap/SIGNATURE_COLLECTION_PLAN.md>)
"""

update_mutation = """
mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
  issueUpdate(id: $id, input: $input) {
    success
    issue {
      identifier
      title
      state { name }
    }
  }
}
"""

res_update = graphql(update_mutation, {
    "id": issue_id,
    "input": {
        "title": "🎉 FENS Akademik Danışman Belirlendi: Prof. Dr. Leila Miller",
        "description": description,
        "stateId": done_state_id
    }
})
print(f"[✓] IUS-5 Güncellendi: {res_update}")

# 4. Add comment to IUS-5
comment_mutation = """
mutation AddComment($input: CommentCreateInput!) {
  commentCreate(input: $input) {
    success
    comment { id }
  }
}
"""
res_comment = graphql(comment_mutation, {
    "input": {
        "issueId": issue_id,
        "body": "🎓 **DANIŞMAN ANLAŞMASI KİLİTLENDİ:** FENS Fakültesi Profesörü Dr. Leila Miller resmi akademik danışmanımız olarak kesinleşti. Masaüstündeki Form F252 Tablo 1'e bilgileri işlendi. Salı günü saat 11:50'de Calculus dersi çıkışında tek fiziki ıslak imzası alınacaktır."
    }
})
print(f"[✓] Yorum Eklendi: {res_comment}")

# 5. Update or check Advisor Document
doc_path = WORKSPACE_ROOT / "templates" / "ACADEMIC_ADVISOR_INVITATION.md"
if doc_path.exists():
    with open(doc_path, "r", encoding="utf-8") as f:
        doc_content = f.read()

    # Query existing documents
    q_docs = """
    query {
      documents {
        nodes {
          id
          title
          url
        }
      }
    }
    """
    res_all_docs = graphql(q_docs)
    adv_doc = next((d for d in res_all_docs.get("documents", {}).get("nodes", []) if "Danışman" in d["title"] or "Advisor" in d["title"]), None)

    if adv_doc:
        doc_mutation = """
        mutation UpdateDoc($id: String!, $input: DocumentUpdateInput!) {
          documentUpdate(id: $id, input: $input) {
            success
            document { id title }
          }
        }
        """
        res_doc = graphql(doc_mutation, {
            "id": adv_doc["id"],
            "input": {
                "title": "FENS Akademik Danışman Resmi Davet Mektubu (Prof. Dr. Leila Miller)",
                "content": doc_content
            }
        })
        print(f"[✓] Danışman Dokümanı Güncellendi ({adv_doc['id']}): {res_doc}")
    else:
        print("[i] Özel danışman dokümanı bulunamadı veya aranmadı.")

print("[✓] Tüm işlemler başarıyla tamamlandı.")

