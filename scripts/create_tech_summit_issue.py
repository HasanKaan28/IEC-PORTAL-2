#!/usr/bin/env python3
"""
Create a dedicated Linear issue for the Annual Technology Summit (IUS TechSummit 2027)
under the Backlog state.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import graphql, get_issues, get_users

users = get_users()
user_map = {u["name"]: u["id"] for u in users}
hasan_id = user_map.get("Hasan Kaan")

existing_issues = get_issues()
team_id = existing_issues[0]["team"]["id"]

backlog_state_id = "c74022fe-04b5-4b6a-a6fd-548d2046f2d8"

mutation = """
mutation CreateIssue($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue {
      id
      identifier
      title
      url
      state { name }
      assignee { name }
    }
  }
}
"""

issue_data = {
    "teamId": team_id,
    "title": "🏛️ [Bahar 2027 / Mayıs] IUS Yıllık Teknoloji Zirvesi (IUS TechSummit 2027): Konsept, Konuşmacılar ve Stantlar",
    "assigneeId": hasan_id,
    "stateId": backlog_state_id,
    "priority": 2,
    "description": """### 🎯 Faaliyet Amacı:
Bahar döneminde (Mayıs ayı 2. haftası) IUS kampüsünde tüm üniversiteyi ve Saraybosna teknoloji ekosistemini bir araya getirecek tam günlük **Yıllık Teknoloji Zirvesini (IUS TechSummit 2027)** organize etmek.

---

### 📋 Zirve Mimarisi ve Yapılacaklar:
- [ ] **Ana Sahne (Amfitiyatro):** Sektörün C-level liderleri ve kıdemli mimarlarıyla ana oturumlar (Yapay Zeka, Otonom Sistemler, Bulut Mimarisi).
- [ ] **Teknik Paneller:** "Yazılım Şirketleri Junior Mühendislerde Ne Arıyor?" ve "Siber Güvenlik & Bulut" uzman panelleri.
- [ ] **Şirket Stantları & CV Drop (Bina A Atriumu):** Bölgedeki partner teknoloji firmaları için stant masaları, staj başvuruları ve birebir mülakat fırsatları.
- [ ] **Öğrenci Proje Demo Sahnesi:** Kulüp bünyesinde geliştirilen ve Hackathon'da (DevHack) dereceye giren en iyi 5 öğrenci projesinin şirket CTO'larına canlı sunumu.
- [ ] **Logistics & Hospitality:** SCC üzerinden Amfi ve Atrium rezervasyonu, ses/kayıt sistemi, konuşmacı karşılama ve teşekkür plaketleri.

---

🔗 **İlgili Resmi Belgeler:**
- [SCC Proposed Annual Activity Plan](https://linear.app/ius-engineering-events/document/scc-proposed-annual-activity-plan-4-core-pillars-and-devhack-20262027-db3b4f5e5a05)
- [SCC Proposed Annual Budget Estimate](https://linear.app/ius-engineering-events/document/scc-proposed-annual-budget-estimate-1300-bam-balanced-and-realistic-127e6ed0a921)
- [IEC Official Club Constitution](https://linear.app/ius-engineering-events/document/ieec-official-club-constitution-ab238dce240a)"""
}

res = graphql(mutation, {"input": issue_data})
print("[✓] Linear Zirve Görevi Oluşturuldu:", res)
