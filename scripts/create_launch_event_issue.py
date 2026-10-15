#!/usr/bin/env python3
"""
Create a dedicated Linear issue for the Grand Welcome & Kickoff Meeting:
The Marshmallow Challenge Edition.
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

# Query states
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
states = graphql(state_query).get("workflowStates", {}).get("nodes", [])
todo_state = next((s for s in states if s["name"].lower() == "todo" or s["type"] == "unstarted"), None)
backlog_state = next((s for s in states if s["name"].lower() == "backlog" or s["type"] == "backlog"), None)

state_id = todo_state["id"] if todo_state else backlog_state["id"]

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

description = """### 🎪 Etkinlik Amacı & Konsept:
IUS Engineering Club (IEC) resmi kuruluş lansmanı ve tüm FENS öğrencileri için ilk büyük tanışma toplantısı! Klasik ve sıkıcı amfi sunumları yerine, dünya çapında (Stanford, Google, TED) uygulanan **Marshmallow Challenge** ile mühendislik ruhunu aksiyonla başlatıyoruz.

---

### 📋 Etkinlik Mimarisi & Marshmallow Challenge Detayları:
- [ ] **Açılış & Vizyon (10 Dk):** Hasan Kaan (Başkan) tarafından kulüp dönem hedefleri ve DevHack 2027 vizyonunun aktarılması; Prof. Dr. Leila Miller (Akademik Danışman) selamlama konuşması.
- [ ] **Karma Takım Dağılımı (15 Dk):** Girişte rastgele renkli kartlarla 4-5 kişilik karma masalar oluşturulması (Yazılım, Makine, Elektrik, Boşnak ve Türk öğrenciler karışık).
- [ ] **⚡ 18 Dakika Marshmallow Challenge:**
  - **Malzemeler (Takım Başına):** 20 çiğ spagetti çubuğu, 1m kağıt bant, 1m pamuk ip, 1 adet bütün marshmallow.
  - **Kural:** Kule serbest ayakta durmalı (free-standing), marshmallow tek parça halinde en tepede olmalı!
  - **Mühendislik Dersi:** Kindergarten vs MBA paradoksu — laf kalabalığı yerine hızlı iterasyon, kafes kiriş (truss) statiği ve stres testi.
- [ ] **Moderatör & Sunucu:** **Muhammed Efe Ural** (*Social Life & Fun Engineering Lead*) — Geri sayım, masalar arası canlı anonslar, enerji yönetimi.
- [ ] **Jüri Ölçümü & Ödüller:** Prof. Dr. Leila Miller ve Hasan Kaan tarafından şerit metreyle en yüksek kulenin ölçülmesi; *Apex Tower*, *Best Architecture* ve *Epic Crash* ödülleri.
- [ ] **Lojistik & Malzeme:** Bekir Enes Çokbekler (Sayman) tarafından malzeme kitlerinin (~24 KM bütçe) hazırlanması.
- [ ] **Medya & PR:** Bakir Bašić (PR Lead) tarafından yarışma anlarının video/reels kaydına alınması ve Instagram lansmanı.
- [ ] **Networking & Komite Kayıtları:** Çay/kahve eşliğinde yeni üyelerin teknik komitelere yönlendirilmesi.

---

🔗 **İlgili Operasyonel Belge:**
👉 [**📋 Detaylı Etkinlik Kılavuzu: roadmap/MARSHMALLOW_CHALLENGE_KICKOFF.md**](<https://github.com/HasanKaan28/ius-engineering-events/blob/main/roadmap/MARSHMALLOW_CHALLENGE_KICKOFF.md>)
"""

issue_data = {
    "teamId": team_id,
    "title": "🎪 [Kasım 1. Hafta] IEC Büyük Tanışma Toplantısı: The Marshmallow Challenge (Icebreaker & Spagetti Kuleleri)",
    "assigneeId": hasan_id,
    "stateId": state_id,
    "priority": 1,
    "description": description
}

res = graphql(mutation, {"input": issue_data})
print("[✓] Linear Marshmallow Challenge Görevi Oluşturuldu:", res)
