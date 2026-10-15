#!/usr/bin/env python3
"""
Add operational comment to IUS-15 about Muhammed Efe Ural's role in poster design & Instagram leadership.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import graphql, get_issues

issues = get_issues()
ius15 = next((i for i in issues if i["identifier"] == "IUS-15"), None)
if not ius15:
    print("[-] IUS-15 not found")
    sys.exit(1)

comment_mutation = """
mutation CreateComment($input: CommentCreateInput!) {
  commentCreate(input: $input) {
    success
    comment { id }
  }
}
"""

body = """🎨 **SOSYAL MEDYA & AFİŞ TASARIMI (MUHAMMED EFE URAL):**
- Kulübün resmi Instagram içerik üretimi ve hesap yönetimi (açıldığında) doğrudan **Muhammed Efe Ural**'a devredilmiştir.
- Efe şu anda **Büyük Tanışma Günü & The Marshmallow Challenge** için resmi tanıtım afişini ve Instagram duyuru görsellerini tasarlamaktadır.
- Bakir Bašić ile koordineli olarak kampüs içi baskı ve dijital tanıtım yürütülecektir."""

res = graphql(comment_mutation, {"input": {"issueId": ius15["id"], "body": body}})
print("[✓] IUS-15 Yorum Eklendi:", res)
