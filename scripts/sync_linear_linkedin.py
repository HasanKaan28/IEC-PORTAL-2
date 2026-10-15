import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from linear_ops import graphql, get_issues, get_users, create_issue, update_issue

def main():
    print("[1] Fetching Linear Team & Workflow States...")
    q = """
    query {
      teams {
        nodes {
          id
          key
          name
          states {
            nodes {
              id
              name
              type
            }
          }
        }
      }
    }
    """
    res = graphql(q)
    team = res.get("teams", {}).get("nodes", [])[0]
    team_id = team["id"]
    print(f"Team: {team['name']} ({team['key']}, ID: {team_id})")
    
    states = {s["name"].lower(): s["id"] for s in team.get("states", {}).get("nodes", [])}
    print("Available States:", states)
    
    users = get_users()
    user_map = {u["name"].lower(): u["id"] for u in users}
    print("Available Users:", user_map)
    
    hasan_id = next((u["id"] for u in users if "hasan" in u["name"].lower()), None)
    
    done_state_id = states.get("done")
    backlog_state_id = states.get("backlog")
    
    # Check if LinkedIn issue already exists
    issues = get_issues()
    linkedin_issue = next((i for i in issues if "linkedin" in i["title"].lower()), None)
    
    linkedin_desc = """### 🌐 IUS Engineering Club — Resmi LinkedIn Şirket Sayfası (Tamamlandı)

Kulübün uluslararası ve kurumsal temsili, sponsorluk ilişkileri (Bit Alliance vb.) ve yönetim kurulu üyelerinin profillerinde logolu deneyim gösterebilmesi için resmi LinkedIn Şirket Sayfası başarıyla açıldı ve yapılandırıldı.

#### 📌 Canlı Sayfa Bağlantısı:
👉 [https://www.linkedin.com/company/ius-engineering-club](https://www.linkedin.com/company/ius-engineering-club)

---

#### ✅ Tamamlanan Yapılandırmalar:
- [x] **Resmi İsim & URL**: `IUS Engineering Club` (`/company/ius-engineering-club`)
- [x] **Yüksek Çözünürlüklü Logo**: Multidisipliner mühendislik arması (Dişli, Devre, Kod Parantezi `{IEC}`) profil fotoğrafı olarak yüklendi.
- [x] **Orantılı Kapak Banner'ı (1128x191 px)**: Özel üretilen siber devre ve IUS logolu yatay kapak fotoğrafı tam LinkedIn standardında yüklendi.
- [x] **İngilizce Kurumsal Tanıtım (About)**: FENS ve üniversite vizyonu, 4 ana faaliyet alanı (AI bootcampleri, hackathonlar, laboratuvarlar, şirket köprüleri) eklendi.
- [x] **Resmi Kampüs Konumu**: `Hrasnička Cesta 15, FENS Campus, 71210 Ilidža, Sarajevo, Bosnia and Herzegovina` eklendi.
- [x] **Sektör & Büyüklük**: `Yüksek Öğrenim` (Higher Education), `11-50 çalışan`, `Kâr amacı gütmeyen kuruluş`.
- [x] **Yönetici Rol Dağılımı**:
  - **Super Admin**: Hasan Kaan & Mahmut İhsan Avcı
  - **Content Admin**: Muhammed Efe Ural & Bakir Bašić
  - **Admin**: Kaan Mete Şenyıldız & Bekir Enes Çokbekler
- [x] **Kişisel Profil Rozeti**: Hasan Kaan kendi profiline `Co-Founder & President` deneyimini logolu olarak bağladı.
"""

    if linkedin_issue:
        print(f"Updating existing LinkedIn issue {linkedin_issue['identifier']}...")
        update_issue(linkedin_issue["id"], {
            "title": "🎉 Resmi LinkedIn Şirket Sayfası Kurulumu (Tamamlandı)",
            "description": linkedin_desc,
            "stateId": done_state_id,
            "priority": 1
        })
        print(f"[✓] {linkedin_issue['identifier']} marked as DONE!")
    else:
        print("Creating new LinkedIn issue...")
        create_mutation = """
        mutation CreateIssue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              identifier
              title
              url
            }
          }
        }
        """
        payload = {
            "teamId": team_id,
            "title": "🎉 Resmi LinkedIn Şirket Sayfası Kurulumu (Tamamlandı)",
            "description": linkedin_desc,
            "stateId": done_state_id,
            "priority": 1,
            "assigneeId": hasan_id
        }
        res_c = graphql(create_mutation, {"input": payload})
        new_ident = res_c.get("issueCreate", {}).get("issue", {}).get("identifier")
        print(f"[✓] Created LinkedIn issue {new_ident} as DONE!")

    # Check Instagram issue
    insta_issue = next((i for i in issues if "instagram" in i["title"].lower()), None)
    insta_desc = """### 🤫 Resmi Kulüp Instagram & Ortak E-posta Lansmanı (Stealth Mod - M. Efe Ural)

Kulüp için Instagram hesabının oluşturulması, stratejik olarak **resmi SCC ve Rektörlük onayı çıkana kadar dondurulmuştur (Stealth Mod Embargo)**.

#### 🎯 Stratejik Kararlar:
1. **Şahsi E-posta / Telefon Karışıklığını Önleme**: Kişisel hesaplar yerine ileride kulüp adına temiz bir ortak Gmail (`iusengineeringclub@gmail.com`) veya IUS IT Center'dan alınacak resmi kulüp maili üzerinden açılacaktır. Böylece 2FA/SMS kodları kişisel cihazlara bağımlı kalmayacaktır.
2. **Üniversite İçi Stealth Mod Güvencesi**: Rektörlük kulübü onaylamadan kamuya açık takipçi toplamak ve paylaşımlar yapmak erken bürokratik dikkat çekebilir. Resmi onay çıktığı gün büyük lansman yapılacaktır.
3. **Marshmallow Challenge Afişi**: Afişlerde Instagram kullanıcı adı `@iusengineeringclub (Official launch coming soon / TBA)` olarak bırakılmıştır.
4. **Sorumlu Lider**: Muhammed Efe Ural (Sosyal Medya & Tasarım Lideri).
"""

    if insta_issue:
        print(f"Updating existing Instagram issue {insta_issue['identifier']}...")
        update_issue(insta_issue["id"], {
            "title": "🤫 [Resmi Onay Sonrası] Resmi Kulüp Instagram & Ortak E-posta Lansmanı (Stealth Mod - M. Efe Ural)",
            "description": insta_desc,
            "stateId": backlog_state_id,
            "priority": 2
        })
        print(f"[✓] {insta_issue['identifier']} updated!")
    else:
        print("Creating new Instagram backlog issue...")
        create_mutation = """
        mutation CreateIssue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              identifier
              title
              url
            }
          }
        }
        """
        payload = {
            "teamId": team_id,
            "title": "🤫 [Resmi Onay Sonrası] Resmi Kulüp Instagram & Ortak E-posta Lansmanı (Stealth Mod - M. Efe Ural)",
            "description": insta_desc,
            "stateId": backlog_state_id,
            "priority": 2,
            "assigneeId": hasan_id
        }
        res_i = graphql(create_mutation, {"input": payload})
        new_ident_i = res_i.get("issueCreate", {}).get("issue", {}).get("identifier")
        print(f"[✓] Created Instagram issue {new_ident_i} in BACKLOG!")

if __name__ == "__main__":
    main()
