#!/usr/bin/env python3
"""
Sync Signature Collection Plan with Linear, Local Templates, and Desktop Form F252.
"""

import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import graphql, get_issues
import fill_docx_form

def run_sync():
    print("[1/4] Updating Desktop Word document (Form F252)...")
    fill_docx_form.fill_docx()

    print("[2/4] Fetching Linear issue IUS-8...")
    issues = get_issues()
    ius8 = next((iss for iss in issues if iss["identifier"] == "IUS-8"), None)
    
    if not ius8:
        print("[!] IUS-8 issue not found in Linear!")
        return

    ius8_id = ius8["id"]
    print(f"    Found IUS-8 ID: {ius8_id}")

    # Add Comment to IUS-8
    comment_mutation = """
    mutation CreateComment($input: CommentCreateInput!) {
      commentCreate(input: $input) {
        success
        comment {
          id
        }
      }
    }
    """
    
    comment_body = """### ✍️ PAZARTESİ & SALI FİZİKİ İMZA TOPLAMA OPERASYONU (MİN. 10 ÜYE)

Masaüstündeki resmi **Form F252 (Student Club Registration Form)** için Rektörlük/SCC şartı olan **asgari 10 ıslak imza** toplanıyor.

#### 📅 Ders Programına Göre 1'er Saatlik Mola Saatleri & Buluşma Aralıkları:
* 🎯 **Salı 1. Ana Mola:** **11:50 – 13:00** (MATH101 Calculus çıkışı, 70 dk boşluk)
* 🎯 **Salı 2. Ana Mola:** **14:50 – 16:00** (ENS101 Engineering çıkışı, 70 dk boşluk)
* 🎯 **Pazartesi:** **14:50 sonrası** (CS103 Programlama çıkışı) veya **11:50 - 12:00** (Physics arası)
* **Buluşma Noktası:** Kampüs A/B Blok Koridorları (F1/F2), Kütüphane & Kafeterya

#### 📋 Doğrulanacak Asil 10 İmzacı Listesi (O Gün Okulda Olacaklar):
1. [ ] **Kaan Mete Şenyıldız** (Başkan - 2. Sınıf - No: 250302201)
2. [ ] **Hasan Kaan Karabulut** (Kurucu Ortak & Bşk. Yrd. - 1. Sınıf - No: 250302195)
3. [ ] **Mahmut İhsan Avcı** (Kurucu Ortak & Sekreter - 1. Sınıf - No: 250302233)
4. [ ] **Bekir Enes Çokbekler** (Sayman - 1. Sınıf - No: 250302229)
5. [ ] **Bakir Bašić** (PR & Media Lead - 1. Sınıf - No: 260302030) 🇧🇦
6. [ ] **Bilal Yusuf Şimşek** (Kurucu Üye - 1. Sınıf - No: 250302196) 🇹🇷
7. [ ] **Nazlıcan Cebeci** (Kurucu Üye - 1. Sınıf - No: 250302243) 🇹🇷
8. [ ] **Muhammed Emin Tiryaki** (Kurucu Üye - 2. Sınıf - No: 250302247) 🇹🇷
9. [ ] **Emin Efe Duman** (Kurucu Üye - 1. Sınıf - No: 250302211) 🇹🇷
10. [ ] **Ahmed Hadzimurati** (Kurucu Üye - 1. Sınıf - No: 260302051) 🇧🇦

#### 👥 Yedek İmzacı Havuzu (Okula gelemeyen olursa anında devreye girecekler):
* **Ömer Arif Açıkel** (250302232)
* **Mert Çınar Atalay** (250302162)
* **Ferit Enes Seymenliler** (240302180)
* **Hüseyin Talha Seymenliler** (240302179)
* **Muhammed Efe Ural** (240302169)
* **Abdullah Uzun** (250201110)

*Tüm üyelere özelden Pazartesi/Salı uygunluk mesajı gönderilmektedir.*"""

    print("[3/4] Posting operation comment to Linear IUS-8...")
    res_c = graphql(comment_mutation, {"input": {"issueId": ius8_id, "body": comment_body}})
    if res_c.get("commentCreate", {}).get("success"):
        print("[✓] Linear IUS-8 comment successfully posted!")
    else:
        print("[!] Failed to post Linear comment:", res_c)

    print("[4/4] Updating Linear Roster Document...")
    # Document ID for Roster: 8be26629-83d3-4c7a-a7a0-66ebb1f51480
    doc_mutation = """
    mutation UpdateDoc($id: String!, $input: DocumentUpdateInput!) {
      documentUpdate(id: $id, input: $input) {
        success
        document {
          id
          title
        }
      }
    }
    """
    
    workspace_root = Path(__file__).resolve().parent.parent
    roster_path = workspace_root / "templates" / "SCC_FOUNDING_10_MEMBERS.md"
    if roster_path.exists():
        with open(roster_path, "r", encoding="utf-8") as f:
            roster_content = f.read()
        res_d = graphql(doc_mutation, {"id": "8be26629-83d3-4c7a-a7a0-66ebb1f51480", "input": {"content": roster_content}})
        if res_d.get("documentUpdate", {}).get("success"):
            print("[✓] Linear Roster Document successfully synchronized!")
        else:
            print("[!] Document update status:", res_d)

    print("\n✨ ALL OPERATIONS SYNCHRONIZED SUCCESSFULLY!")

if __name__ == "__main__":
    run_sync()
