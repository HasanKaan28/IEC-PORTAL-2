# Project Context: IUS Engineering Club

## 1. Overview & Vision
- **Organization**: IUS Engineering Club (International University of Sarajevo)
- **Institution**: International University of Sarajevo (IUS), Faculty of Engineering and Natural Sciences (FENS)
- **Leadership**: Led by Club Captain / President with a core founding committee.
- **Language**: 100% English (Official documents, external partnerships, event communications).
- **Mission**: Bridging the gap between university engineering curriculum and real-world industrial practice via hands-on workshops, hackathons, AI/coding bootcamps, student engineering projects, and high-impact industry networking in Sarajevo and globally.

## 2. Directory Structure
```
ius-engineering-events/
├── .agents/rules/project-context.md   # Architectural snapshot & memory
├── constitution/
│   └── CONSTITUTION.md               # Official Club Constitution (English)
├── organization/
│   ├── ORGANIZATIONAL_STRUCTURE.md   # Core leadership, committees & hierarchy
│   └── ROLE_DESCRIPTIONS.md          # Duties, responsibilities & KPIs
├── roadmap/
│   ├── SEMESTER_1_ACTION_PLAN.md     # 12-week operational milestone calendar
│   └── FLAGSHIP_EVENTS.md            # Detailed blueprints for hackathons & summits
├── templates/
│   ├── ACADEMIC_ADVISOR_INVITATION.md# Formal invitation for FENS Professors
│   ├── IUS_SKS_APPLICATION_PETITION.md# SKS / Student Affairs registration form
│   └── EVENT_PROPOSAL_FORM.md        # Standard university event petition
├── pr_and_branding/
│   ├── LINKEDIN_PAGE_SETUP.md        # LinkedIn Company Page blueprint & copy
│   └── SOCIAL_MEDIA_LAUNCH_KIT.md    # Instagram & multi-channel PR playbook
├── graphify-out/
│   ├── graph.json                    # Interactive ecosystem graph dataset
│   └── graph.html                    # Cyberpunk Observatory Interactive Visualizer
├── GEMINI.md                         # Persistent workspace metadata
└── README.md                         # Executive project documentation
```

## 3. Core Pillars & Committees
1. **Multidisciplinary Engineering Committee**: Cross-discipline hardware/software integration (EE, ME, CS, IE).
2. **Software & Artificial Intelligence Committee**: CS/SE deep dives, modern web/cloud architecture, LLMs/GenAI, coding bootcamps.
3. **Applied Engineering Projects**: Practical student development circles, prototypes, and semester showcases.
4. **Operations & Event Logistics**: Venue reservation (IUS Amphitheater, A-Block, Labs), technical equipment, ticketing/registration.
5. **PR & External Media Lead**: Bakir Bašić (FENS 1st Year) — Institutional PR, media relations, photography, university announcements, and Bosnian community outreach.
6. **Social Media & Sponsorship Lead**: Muhammed Efe Ural (FENS 2nd Year) — Direct ownership of club Instagram (resmi hesap açıldığında duyurulacak / TBA), visual poster designs (Marshmallow Challenge kickoff flyer), viral reels, and corporate tech sponsorships.

## 4. Operational Infrastructure & Integrations
- **Management Team Application Form**: [https://forms.gle/v8c85MgFUmVvpzTH6](https://forms.gle/v8c85MgFUmVvpzTH6)
- **Live Google Sheet Responses**: [https://docs.google.com/spreadsheets/d/1pLeiQpBNSfDFPGa5IqLbSGoz0Z2Lm3Olu-mq3XZhzbQ/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1pLeiQpBNSfDFPGa5IqLbSGoz0Z2Lm3Olu-mq3XZhzbQ/edit?usp=sharing)
- **Spreadsheet Live Fetcher**: [`scripts/fetch_google_sheet.py`](file:///C:/Users/Kaan/.gemini/antigravity-ide/scratch/ius-engineering-events/scripts/fetch_google_sheet.py)
- **Management Ideas & Projects Submission Form**: [https://docs.google.com/forms/d/e/1FAIpQLSeZ3RHZbw2BMaboNw4yS0xLALOv4KXzXdAg1gyF-434rMP5Ew/viewform](https://docs.google.com/forms/d/e/1FAIpQLSeZ3RHZbw2BMaboNw4yS0xLALOv4KXzXdAg1gyF-434rMP5Ew/viewform)
- **Management Ideas & Projects Pool (Google Sheet)**: [https://docs.google.com/spreadsheets/d/1r9aVO0WNHy4AtvIQu1rExEB9X1of1KBOU5ErUTf0jFw/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1r9aVO0WNHy4AtvIQu1rExEB9X1of1KBOU5ErUTf0jFw/edit?usp=sharing)
- **Management Ideas Live Fetcher**: [`scripts/fetch_management_ideas.py`](file:///C:/Users/Kaan/.gemini/antigravity-ide/scratch/ius-engineering-events/scripts/fetch_management_ideas.py)
- **Official WhatsApp Community**: [https://chat.whatsapp.com/LKMpyfm7K5R3F0rXezcXXN](https://chat.whatsapp.com/LKMpyfm7K5R3F0rXezcXXN)
- **Task & Team Management Platform**: Linear.app (100% Free, unlimited team members, native desktop & iOS/Android apps).
- **IDE Automation Bridge**: [`scripts/linear_manager.py`](file:///C:/Users/Kaan/.gemini/antigravity-ide/scratch/ius-engineering-events/scripts/linear_manager.py) & [`scripts/linear_ops.py`](file:///C:/Users/Kaan/.gemini/antigravity-ide/scratch/ius-engineering-events/scripts/linear_ops.py) (GraphQL API integration).
- **Observatory Knowledge Graph Synchronizer**: [`scripts/sync_observatory.py`](file:///C:/Users/Kaan/.gemini/antigravity-ide/scratch/ius-engineering-events/scripts/sync_observatory.py) (Pulls live Linear tasks, Google Form responses, board member relationships, and updates `graphify-out/graph.json` and `graph.html`).
- **GitHub Repository (Private Vault)**: [https://github.com/HasanKaan28/ius-engineering-events](https://github.com/HasanKaan28/ius-engineering-events)
- **Public Web Repository (GitHub Pages)**: [https://github.com/HasanKaan28/ius-engineering-events-site](https://github.com/HasanKaan28/ius-engineering-events-site)
- **Permanent 7/24 Live Observatory (GitHub Pages)**: [https://hasankaan28.github.io/ius-engineering-events-site/](https://hasankaan28.github.io/ius-engineering-events-site/) (Kalıcı, 7/24 aktif, sınırsız global CDN).
- **Private Innovation Projects Showcase (Gizli / Private)**: Yerel `http://localhost:8085/projects/` ve sadece [HasanKaan28/ius-engineering-events](https://github.com/HasanKaan28/ius-engineering-events) özel reposunda saklanır. Dışarıya kapalıdır; yönetim kurulu ve yetkili üyelerin erişimine özeldir.
- **Showcase Synchronizer**: [`scripts/sync_projects_showcase.py`](file:///C:/Users/Kaan/.gemini/antigravity-ide/scratch/ius-engineering-events/scripts/sync_projects_showcase.py) (Google Sheet form havuzundaki fikirleri AI görselleri ve çift dil ile gizli repodaki vitrine senkronize eder).
- **Certificate Verification Portal (7/24 GitHub Pages)**: [https://hasankaan28.github.io/ius-engineering-events-site/verify/](https://hasankaan28.github.io/ius-engineering-events-site/verify/) (Online sertifika sorgulama ve LinkedIn lisans ekleme kapısı).
- **Public Site Deployment Bridge**: [`scripts/deploy_public_site.py`](file:///C:/Users/Kaan/.gemini/antigravity-ide/scratch/ius-engineering-events/scripts/deploy_public_site.py) (Tek tıkla tüm web varlıklarını ve doğrulama portalını public depoya senkronize eder).
- **Automated Certificate Cloud Engine**: [`scripts/IEC_AutoCert_Engine.js`](file:///C:/Users/Kaan/.gemini/antigravity-ide/scratch/ius-engineering-events/scripts/IEC_AutoCert_Engine.js) (Google Apps Script ile form/sheet üzerinden 7/24 otomatik PDF basımı ve Gmail dağıtımı).
- **Certificate Generator & CLI Engine**: [`scripts/generate_certificates.py`](file:///C:/Users/Kaan/.gemini/antigravity-ide/scratch/ius-engineering-events/scripts/generate_certificates.py) (Yerel ReportLab yüksek çözünürlüklü vektör PDF üretimi).
- **Official Certificate Blueprint & Guide**: [`templates/CERTIFICATE_AUTOMATION_BLUEPRINT.md`](file:///C:/Users/Kaan/.gemini/antigravity-ide/scratch/ius-engineering-events/templates/CERTIFICATE_AUTOMATION_BLUEPRINT.md).
- **Interactive Cyberpunk Observatory**: [`graphify-out/graph.html`](file:///C:/Users/Kaan/.gemini/antigravity-ide/scratch/ius-engineering-events/graphify-out/graph.html) (Local `http://localhost:8085/`).
- **Masaüstü IEC Klasörü & Kategorileri (Desktop IEC Hub)**: `C:\Users\Kaan\Desktop\IEC` — Kulüple ilgili tüm belgeler, formlar, sunumlar ve indirmeler 7 resmi kategoride depolanır:
  1. `01_Resmi_Basvuru_Formlari`: Resmi Form F252, dilekçeler ve kurucu üye listeleri.
  2. `02_Dekanlik_ve_Akademik_Danisman`: Dekanlık sunumu (PDF/HTML) ve danışman davetiyesi.
  3. `03_Tuzuk_Butce_ve_Planlar`: Tüzük, 1.300 KM taslak bütçe ve 12 haftalık faaliyet planları.
  4. `04_Marka_Logo_ve_Tasarim`: Yüksek çözünürlüklü logolar, bannerlar ve afişler.
  5. `05_LinkedIn_ve_Sosyal_Medya`: LinkedIn şirket sayfası ve yönetici profil rehberleri, medya kitleri.
  6. `06_Etkinlikler_ve_Workshoplar`: Marshmallow Challenge, DevHack, atölye ve imza operasyonu planları.
  7. `07_Indirilenler_Downloads`: Kulüp için internetten veya harici kaynaklardan indirilen tüm sponsorluk dosyaları, CV'ler, formlar ve geçici veriler.
  *(ZORUNLU KURAL: Bilgisayara kulüp için herhangi bir dosya indirileceğinde, üretileceğinde veya dışarıdan aktarılacağında HER SEFERİNDE doğrudan bu klasör ve ilgili kategorisi kullanılır).*
- **Founding & Member Status**: 
  - **Akademik Danışman (Academic Faculty Advisor)**:
    - 🎓 **Prof. Dr. Leila Miller** (Full Professor Dr., FENS, E-mail: `lmiller@ius.edu.ba`, Tel: `033 957 -`, Asistan: Ilma Papić `itarhanis-papic@ius.edu.ba`). Kulübün resmi akademik danışmanı olarak belirlendi ve tüm başvuru evraklarına işlendi.
  - **Yönetim Kurulu (4 Kişi)**: 
    - 👑 **Kurucu Ortak & Başkan (Co-Founder & President)**: Hasan Kaan (Yönetim Kurulu üyeleri ile birlikte vizyon, teknik yapılanma ve kararları kolektif olarak koordine eden kurucu başkan; takım ruhunu ön planda tutar).
    - 🚀 **Kurucu Ortak & Başkan Yardımcısı (Co-Founder & Vice President)**: Mahmut İhsan Avcı (Operasyonel sağ kol, üye alımları, bürokrasi, topluluk moderasyonu ve toplantı kayıtları).
    - 💰 **Sayman & Finans Lideri (Treasurer & Finance Lead)**: Bekir Enes Çokbekler (Bütçe yönetimi, 1.300 KM finansal mimari ve kurumsal sponsorluklar).
    - 📣 **PR & Medya / Sponsorluk Lideri (PR & Media Lead)**: Muhammed Efe Ural (Kulübün ASIL PR ve medya lideri; resmi kulüp Instagram hesabının tam mülkiyeti, afiş ve görsel tasarımlar, LinkedIn şirket içerikleri, viral reels paylaşımları ve şirket kurumsal sponsorluk ortaklığı). 4/4 Asil Kadro Onaylandı! 🎯
  - **3 Katmanlı Sürdürülebilir Finansman Mimarisi (1.300 KM)**:
    - **Tier 1 (Şirket Sponsorlukları - 800 KM)**: Saraybosna teknoloji ekosistemi (Bit Alliance firmaları) ile seminer, hackathon ve zirve destekleri.
    - **Tier 2 (Üniversite / SCC Hibe Desteği - 300 KM)**: Öğrenci kulübü faaliyet ödeneği, afiş baskısı ve kampüs lojistiği için okul desteği.
    - **Tier 3 (Yedek Güvence / Katılımcı Cüzi Katkı Payı - 200 KM)**: Sadece büyük ölçekli ve yüksek maliyetli amiral gemisi etkinliklerde (örneğin 24 saatlik yatılı DevHack maratonunda catering/materyal giderleri), sponsorluk ve okul bütçesi yetersiz kaldığı takdirde katılımcılardan toplanacak sembolik ~5 KM cüzi pay. Normal haftalık AI atölyeleri ve tech-talklar tüm IUS öğrencilerine **%100 ücretsizdir**.
    - **Toplam Bütçe**: 1.300 KM dengeli taslak teklif (Prijedlog).
  - **Normal Üyeler (10 Kişi Hedefi)**: 12/10 kayıtlı tam kadro: Bilal Yusuf Şimşek, Nazlıcan Cebeci, Muhammed Emin Tiryaki, Emin Efe Duman, Ömer Arif Açıkel, Mert Çınar Atalay, Ferit Enes Seymenliler, Hüseyin Talha Seymenliler, Muhammed Efe Ural, Abdullah Uzun, Ahmed Hadzimurati, Işıl Irmak Cihan. Tüzük 10 Kurucu Üye kotası %120 ile aşıldı! 🎯
    - **Pazartesi & Salı İmza Toplama Operasyonu (12-13 Ekim 2026)**: Resmi Form F252 okul baskı birimine gönderildi (10 Ekim 2026), Pazartesi sabahı fiziki çıktı teslim alınacak. Masaüstü IEC klasöründeki (`C:\Users\Kaan\Desktop\IEC\01_Resmi_Basvuru_Formlari\student_club_registration_form_f252.docx`) Tablo 3 için SCC şartı olan en az 10 ıslak imza toplanmaktadır. Asil 10 kadro: Kaan Mete Şenyıldız (Bşk), Hasan Kaan Karabulut (Bşk Yrd), Mahmut İhsan Avcı (Sekreter), Bekir Enes Çokbekler (Sayman), Bakir Bašić (PR Lead), Bilal Yusuf Şimşek, Nazlıcan Cebeci, Muhammed Emin Tiryaki, Emin Efe Duman, Ahmed Hadzimurati. 7 kişilik yedek havuz hazır tutulmaktadır (Işıl Irmak Cihan ile birlikte).
    - Tüm başvuru evrakları (`templates/` ve `export_documents/`) okula sunulacak resmi **Prijedlog (Proposal)** formatındadır.
    - Hiçbir bütçe kalemi, üyelik veya izin "Onaylandı" olarak doldurulmaz; tüm kalemler **Projekcija / Planirano / Pending SCC Review** olarak işaretlenmiştir.
    - Okula teslim edilecek belgelerde iç yönetim notları (göstermelik başkan vb.) kesinlikle yer almaz; resmi unvanlar, ıslak imza satırları ve okulun değerlendirme/kaşeleme yapacağı boş SCC kutuları mevcuttur.

## 5. Key Milestones
- **M1 (Week 1–2)**: Faculty Advisor recruitment & SKS official filing.
- **M2 (Week 3–4)**: Core team onboarding, Linear workspace setup & IUS-wide Welcome Meeting / Launch Event.
- **M3 (Week 5–8)**: Weekly AI/Prompt labs & Monthly on-campus keynotes.
- **M4 (Week 9–12)**: Flagship IUS Hackathon (DevHack 2027), Annual Technology Summit (IUS TechSummit 2027) & Semester Showcase.
