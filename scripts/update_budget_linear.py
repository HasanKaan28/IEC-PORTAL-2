#!/usr/bin/env python3
"""
Update Linear Document for Draft Budget and corresponding issue descriptions to reflect the safe 1,300 KM budget.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import graphql, get_issues

workspace_root = Path(__file__).resolve().parent.parent

with open(workspace_root / "templates" / "SCC_DRAFT_BUDGET.md", "r", encoding="utf-8") as f:
    budget_content = f.read()

# 1. Update Linear Document
doc_mutation = """
mutation UpdateDoc($id: String!, $input: DocumentUpdateInput!) {
  documentUpdate(id: $id, input: $input) {
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

res_doc = graphql(doc_mutation, {
    "id": "02003d18-aaaa-4236-a983-abff05a1b4e4",
    "input": {
        "title": "SCC Proposed Annual Budget Estimate (1,300 BAM - Balanced & Realistic)",
        "content": budget_content
    }
})
print(f"[✓] Bütçe Dokümanı Güncellendi: {res_doc}")

# 2. Update IUS-6 and IUS-13 descriptions
issues = get_issues()
issue_map = {i["identifier"]: i for i in issues}

iss_mutation = """
mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
  issueUpdate(id: $id, input: $input) {
    success
    issue {
      identifier
      title
    }
  }
}
"""

if "IUS-6" in issue_map:
    desc_6 = """### 🎯 Görev Amacı:
SCC'nin istediği faaliyet planı ve tahmini bütçe evraklarını eksiksiz hazır hale getirmek.

### 📄 Doğrudan Açılabilir Resmi Belgeler:

1. 👉 [**🔗 TIKLAYIN: SCC Yıllık Faaliyet Planı (2026/2027)**](https://linear.app/ius-engineering-events/document/scc-yillik-faaliyet-plani-4-temel-sutun-and-devhack-20262027-db3b4f5e5a05)
2. 👉 [**🔗 TIKLAYIN: SCC Taslak Yıllık Bütçe Tahmini (1.300 KM - 3 Katmanlı Model)**](https://linear.app/ius-engineering-events/document/scc-taslak-yillik-butce-tahmini-1300-km-gercekci-and-guvenli-127e6ed0a921)

---

### 📋 Yapılması Gereken Adım Adım Liste:

- [ ] Faaliyet planını incelemek (4 Temel Sütun: Haftalık AI, Kampüs Konuşmacısı, Online Tech-Talks, DevHack 2027).
- [ ] **1.300 KM 3 Katmanlı Dengeli Bütçe Tablosunu** kontrol etmek:
  * **1. Katman (Şirket Sponsorlukları):** 800 KM (Saraybosna teknoloji firmaları - Bit Alliance).
  * **2. Katman (Üniversite / SCC Hibe Desteği):** 300 KM (Öğrenci kulübü faaliyet ödeneği ve lojistik katkı).
  * **3. Katman (Yedek Güvence - Katılımcı Cüzi Katkı Payı):** 200 KM (DevHack gibi büyük bütçeli etkinliklerde açık kalması durumunda ~5 KM sembolik katılım payı). Normal atölyeler öğrencilerimize %100 ücretsizdir!
- [ ] Başvuru haftasında bu belgelerin çıktısını alıp başvuru poşet dosyasına eklemek."""
    graphql(iss_mutation, {
        "id": issue_map["IUS-6"]["id"],
        "input": {"description": desc_6}
    })
    print("[✓] IUS-6 Açıklaması 3 Katmanlı 1.300 KM modeli olarak güncellendi.")

if "IUS-13" in issue_map:
    desc_13 = """### 🎯 Faaliyet Amacı:
Bu yıl içinde IUS kampüsünde gerçekleştireceğimiz **24 saatlik büyük yazılım ve mühendislik hackathonunu (IUS DevHack)** planlamak.

### 📋 Yapılacaklar:
- [ ] **Hedef Dönem:** Bahar 2027 (Nisan 2. haftası - vize sonrası, finaller öncesi).
- [ ] **Gece Kalma & Kampüs İzinleri:** FENS Dekanlığı, SCC ve Kampüs Güvenliği ile 24 saatlik bina kullanımı için ön görüşme protokolü.
- [ ] **3 Katmanlı Finansman Dosyası:** DevHack için ayrılan 700 KM'lik mütevazı bütçeyle katılımcılara gece atıştırmalığı/pizza, yaka kartı ve sertifika baskısı sağlanması. Sponsorluk + okul desteği ile karşılanacak, gerekirse bütçe açığında katılımcılardan 5 KM sembolik katkı payı alınacaktır.
- [ ] **Problem Havuzu ve Mentorlar:** Katılımcı takımlara verilecek gerçek dünya mühendislik problemleri ve sektörden mentor/jüri listesi.

🔗 **İlgili Resmi Belge:** [SCC Taslak Yıllık Bütçe Tahmini (1.300 KM)](https://linear.app/ius-engineering-events/document/scc-taslak-yillik-butce-tahmini-1300-km-gercekci-and-guvenli-127e6ed0a921)"""
    graphql(iss_mutation, {
        "id": issue_map["IUS-13"]["id"],
        "input": {"description": desc_13}
    })
    print("[✓] IUS-13 Açıklaması güncellendi.")
