#!/usr/bin/env python3
"""
Add official progress comment to Linear issue IUS-8 regarding Form F252 printing status.
"""

import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from linear_ops import graphql, get_issues

def add_comment():
    issues = get_issues()
    ius8 = next((iss for iss in issues if iss["identifier"] == "IUS-8"), None)
    if not ius8:
        print("[!] IUS-8 not found in Linear!")
        return

    issue_id = ius8["id"]
    comment_body = """🖨️ **RESMİ BAŞVURU FORMU (FORM F252) BASKIYA GÖNDERİLDİ**

* **Gönderim Tarihi:** 10 Ekim 2026 (Cumartesi)
* **Teslim Alma Tarihi:** 12 Ekim 2026 (Pazartesi Sabahı)
* **İmza Operasyonu Başlangıcı:** Pazartesi 11:50 & 14:50 (CS103 çıkışı)
* **Durum:** Form F252 okul baskı birimine renkli çıktı alınmak üzere başarıyla iletildi. Pazartesi sabahı fiziki kopya teslim alınarak kampüste kurucu yönetim kurulu ve ilk 10 onaylı üyenin ıslak imzaları toplanmaya başlayacaktır."""

    mutation = """
    mutation CreateComment($input: CommentCreateInput!) {
      commentCreate(input: $input) {
        success
        comment {
          id
        }
      }
    }
    """
    res = graphql(mutation, {"input": {"issueId": issue_id, "body": comment_body}})
    if res.get("commentCreate", {}).get("success"):
        print(f"[✓] Linear IUS-8 güncellendi: Baskı durumu yorumu eklendi! (ID: {res['commentCreate']['comment']['id']})")
    else:
        print(f"[!] Yorum eklenemedi: {res}")

if __name__ == "__main__":
    add_comment()
