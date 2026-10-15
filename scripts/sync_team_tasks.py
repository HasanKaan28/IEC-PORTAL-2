#!/usr/bin/env python3
"""
Sync and update Linear tasks for the team based on SCC university requirements.
"""

import sys
from linear_ops import get_users, get_issues, update_issue, create_issue

users = get_users()
issues = get_issues()

user_map = {}
for u in users:
    name = u.get("name", "")
    if "Hasan" in name or "Kaan" in name:
        user_map["hasan"] = u["id"]
    if "Bekir" in name:
        user_map["bekir"] = u["id"]
    if "Mahmut" in name:
        user_map["mahmut"] = u["id"]

team_id = issues[0]["team"]["id"]

# 1. Update IUS-5 (Advisor Invitation) -> Hasan Kaan
for iss in issues:
    if iss["identifier"] == "IUS-5":
        update_issue(iss["id"], {
            "title": "FENS Akademik Danışman Buluşması ve Resmi Onay",
            "description": "FENS fakültesinden (CS, SE, EE veya ME) bir profesör ile görüşülerek 'templates/ACADEMIC_ADVISOR_INVITATION.md' mektubunun sunulması ve SCC resmi başvuru formuna advisor imzasının alınması.",
            "priority": 1,
            "assigneeId": user_map.get("hasan")
        })
        print("[✓] IUS-5 Güncellendi (Hasan Kaan)")

# 2. Update IUS-6 (SKS / SCC Filing) -> Mahmut İhsan Avcı
for iss in issues:
    if iss["identifier"] == "IUS-6":
        update_issue(iss["id"], {
            "title": "SCC Yıllık Faaliyet Planı ve Taslak Bütçenin Hazırlanması",
            "description": "SCC'nin istediği 'templates/SCC_ANNUAL_ACTIVITY_PLAN.md' (faaliyet planı) ve 'templates/SCC_DRAFT_BUDGET.md' (5.000 KM tahmini bütçe) belgelerinin çıktısının alınıp başvuru dosyasına eklenmesi.",
            "priority": 1,
            "assigneeId": user_map.get("mahmut")
        })
        print("[✓] IUS-6 Güncellendi (Mahmut İhsan Avcı)")

# 3. Update IUS-7 (Core Team Sync) -> Hasan Kaan & Ekip
for iss in issues:
    if iss["identifier"] == "IUS-7":
        update_issue(iss["id"], {
            "title": "Çekirdek Ekip Buluşması: SCC Rol Dağılımı ve 2. Sınıf Kuralı",
            "description": "Hasan Kaan, Bekir Enes, Mahmut İhsan ve Kaan Mete ile ilk koordinasyon buluşması. SCC'nin 'Başkan en az 2. sınıf olmalıdır' kuralına göre resmi unvanların (President, VP, Secretary, Treasurer) netleştirilmesi.",
            "priority": 1,
            "assigneeId": user_map.get("hasan")
        })
        print("[✓] IUS-7 Güncellendi (Hasan Kaan)")

# 4. Create New Task: En az 6 Yeni Kurucu Üye Bulma (10 Öğrenci Şartı) -> Bekir Enes
create_issue(
    team_id=team_id,
    title="SCC Şartı: En Az 6 Yeni Kurucu Üye Kaydı (10 Kişilik Liste)",
    desc="SCC kuralı: 'The club must be founded by at least 10 IUS students.' Mevcut 4 kurucuya ek olarak Google Form linkini (FENS öğrencilerine) ileterek listeyi en az 10 kişiye tamamlama ve imzalarını alma.",
    assignee_id=user_map.get("bekir"),
    priority=1
)
print("[✓] Yeni Görev Açıldı: 10 Kurucu Üye Listesi (Bekir Enes)")

# 5. Create New Task: Student Club Promotion Day Hazırlığı -> Bekir Enes & Mahmut İhsan
create_issue(
    team_id=team_id,
    title="Kulüp Tanıtım Günü (Promotion Day) Stant ve Afiş Hazırlığı",
    desc="24 Kasım son başvuru tarihinden sonraki 2 hafta içinde yapılacak stant günü için 'pr_and_branding/SOCIAL_MEDIA_LAUNCH_KIT.md' üzerinden roll-up banner, broşür ve stant demonstrasyonlarının planlanması.",
    assignee_id=user_map.get("bekir"),
    priority=2
)
print("[✓] Yeni Görev Açıldı: Promotion Day Hazırlığı (Bekir Enes)")
