import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def add_hyperlink(paragraph, url, text, color="0A66C2", underline=True, bold=False):
    """
    Adds a proper clickable hyperlink to a python-docx paragraph.
    color default is LinkedIn Blue (#0A66C2).
    """
    part = paragraph.part
    r_id = part.relate_to(url, docx.opc.constants.RELATIONSHIP_TYPE.HYPERLINK, is_external=True)

    hyperlink = parse_xml(
        f'<w:hyperlink xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
        f'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="{r_id}"/>'
    )
    new_run = parse_xml(f'<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')
    rPr = parse_xml(f'<w:rPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')
    
    if color:
        c = parse_xml(f'<w:color xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="{color}"/>')
        rPr.append(c)
    if underline:
        u = parse_xml(f'<w:u xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="single"/>')
        rPr.append(u)
    if bold:
        b = parse_xml(f'<w:b xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')
        rPr.append(b)
        
    font = parse_xml(f'<w:rFonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:ascii="Calibri" w:hAnsi="Calibri"/>')
    rPr.append(font)

    new_run.append(rPr)
    text_node = parse_xml(f'<w:t xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">{text}</w:t>')
    new_run.append(text_node)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)
    return hyperlink

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_directory_document():
    doc = Document()

    # Page Margins: 0.75 in
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Document Header Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    run_title = title_p.add_run("IUS Engineering Club")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(10, 102, 194) # LinkedIn Blue

    subtitle_p = doc.add_paragraph()
    subtitle_p.paragraph_format.space_after = Pt(14)
    run_sub = subtitle_p.add_run("LinkedIn Kurumsal Bağlantı & Sponsorluk Rehberi")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(14)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(33, 37, 41)

    desc_p = doc.add_paragraph()
    desc_p.paragraph_format.space_after = Pt(16)
    desc_p.add_run(
        "Bu doküman, IUS Engineering Club yönetiminin ve üyelerinin LinkedIn üzerinde bağlantı kurması gereken stratejik "
        "şirketlerin doğrudan LinkedIn şirket sayfası bağlantılarını içermektedir. Bu bağlantılar; seminer konuşmacıları, teknik atölye "
        "mentorlukları, staj imkânları ve "
    )
    r_bold = desc_p.add_run("DevHack 2027 Hackathonu")
    r_bold.font.bold = True
    desc_p.add_run(" kurumsal sponsorlukları için doğrudan zemin hazırlamak üzere derlenmiştir.")

    # CATEGORIES DATA
    categories = [
        {
            "title": "1. Saraybosna Yazılım, Yapay Zeka & IT Devleri (Bit Alliance Üyeleri)",
            "description": "Öğrenci hackathonlarına, yazılım kamplarına sponsor olan ve FENS CS/SE öğrencilerini istihdam eden ana firmalar:",
            "color": "0A66C2",
            "items": [
                ("Bit Alliance", "Bosna Hersek IT Sektör Birliği (Tüm IT Firmalarının Çatı Kuruluşu)", "Tüm FENS", "Hackathon Hamisi, Sektör Ağı", "https://www.linkedin.com/company/bit-alliance/"),
                ("Atlantbh", "Yazılım Mühendisliği, Veri & Bulut Çözümleri", "CS / SE", "Öğrenci Stajları (ABH Internship), Hackathon Sponsoru", "https://www.linkedin.com/company/atlantbh/"),
                ("HTEC Group", "Bölgesel Mühendislik & Danışmanlık Devi (Eski Mistral)", "CS / SE / EE", "Teknik Konuşmacı, Hackathon Jürisi", "https://www.linkedin.com/company/htec-group/"),
                ("Authority Partners", "Küresel Kurumsal Yazılım Çözümleri & AP Lab", "CS / SE", "Ücretsiz Eğitimler, Atölye Sponsorluğu", "https://www.linkedin.com/company/authority-partners/"),
                ("Endava (Klika)", "Uluslararası Yazılım Mühendisliği Devi", "CS / SE", "Büyük Çaplı Sponsorluk, Ofis Ziyaretleri", "https://www.linkedin.com/company/endava/"),
                ("Symphony", "Global Dijital Ürün Geliştirme (Trebević Kampüsü)", "CS / SE", "Teknoloji Kampüsü Ziyareti, Tech-Talk", "https://www.linkedin.com/company/symphonyis/"),
                ("Ministry of Programming", "Girişim Stüdyosu (Startup Studio, FinTech, AI)", "CS / SE / IE", "Startup Mentorluğu, AI Atölyeleri", "https://www.linkedin.com/company/ministry-of-programming/"),
                ("Infobip", "Bölgesel Unicorn, Bulut İletişim API Altyapısı", "CS / SE / EE", "API Kredileri, DevHack Ana Sponsorluğu", "https://www.linkedin.com/company/infobip/"),
                ("ZIRA", "Telekom & FinTech BSS Yazılımları (Global İhracat)", "CS / SE", "Kurumsal Yazılım Semineri, Stajlar", "https://www.linkedin.com/company/zira/"),
                ("Comtrade 360", "Bulut, Veri Güvenliği & Altyapı Yazılımları", "CS / SE / EE", "Bulut/Altyapı Sponsorluğu", "https://www.linkedin.com/company/comtrade-360/"),
                ("Personify Health", "Eski Virgin Pulse - Sağlık & Mobil Teknolojileri", "CS / SE", "Mobil/Web Geliştirme Konuşmacıları", "https://www.linkedin.com/company/personifyhealth/"),
                ("Walter Code", "Yazılım, BIM Teknolojileri & Dijital Modelleme", "CS / SE / IE", "Mühendislik Modelleme Atölyeleri", "https://www.linkedin.com/company/waltercode/"),
                ("Softray Solutions", "Özel Yazılım Çözümleri & Danışmanlık", "CS / SE", "Etkinlik Sponsorluğu, Panelistler", "https://www.linkedin.com/company/softray-solutions/"),
                ("NSoft", "AI Bilgisayarlı Görü, Bahis/Oyun Teknolojileri (Mostar)", "CS / SE", "Yapay Zeka & Görü İşleme Mentorluğu", "https://www.linkedin.com/company/nsoft/"),
                ("Bicom Systems", "Telekomünikasyon, VoIP & PBX Yazılımları", "CS / EE", "Telekomünikasyon Atölyeleri", "https://www.linkedin.com/company/bicomsystems/"),
            ]
        },
        {
            "title": "2. Donanım, Makine, Elektrik & Endüstriyel Üretim Firmaları",
            "description": "FENS bünyesindeki Makine (ME), Elektrik-Elektronik (EE) ve Endüstri (IE) mühendisliği öğrencilerine hitap eden sanayi devleri:",
            "color": "004085",
            "items": [
                ("Prevent CEE", "Otomotiv Yan Sanayi, Kompozit, Metal & Tekstil Devi", "ME / IE", "Fabrika Gezileri, Üretim Stajları", "https://www.linkedin.com/company/prevent-cee/"),
                ("ASA Group", "Otomotiv, Sağlık, Finans & IT Yatırım Grubu", "IE / CS", "Kurumsal Sponsorluk, Yönetim Mentorluğu", "https://www.linkedin.com/company/asa-group/"),
                ("Energoinvest", "Güç Sistemleri, Enerji İletimi & Şebeke Mühendisliği", "EE / ME / CE", "Elektrik Şebekeleri Semineri, Teknik Ziyaret", "https://www.linkedin.com/company/energoinvest/"),
                ("GS-TMT", "Makine İmalatı, CNC, E-Mobilite & Kaynak Teknolojileri", "ME / EE / IE", "Donanım/Robotik Projelerine Destek", "https://www.linkedin.com/company/gs-tmt/"),
                ("Mann+Hummel Group", "Otomotiv & Sanayi Filtrasyon Sistemleri (Tešanj)", "ME / IE", "Kalite Kontrol & Yalın Üretim Seminerleri", "https://www.linkedin.com/company/mann-hummel-group/"),
                ("Volkswagen Sarajevo", "Şasi & Otomotiv Komponent Üretim Merkezi (Vogošća)", "ME / EE / IE", "Otomotiv Mühendisliği Gezisi", "https://www.linkedin.com/company/volkswagen-sarajevo-d-o-o/"),
                ("EMKA Group (Bekto Precisa)", "Hassas Kalıp İmalatı, Metal & Plastik Enjeksiyon", "ME / IE", "Kalıp & CAD/CAM Atölyeleri", "https://www.linkedin.com/company/emka-beschlagteile-gmbh/"),
            ]
        },
        {
            "title": "3. Bosna'daki Türk & Bölgesel Şirketler (IUS ile Doğal Bağlantı)",
            "description": "IUS'un uluslararası ve Türkiye kökenli yapısı sayesinde kulübümüze en hızlı dönüş yapabilecek kurumlar:",
            "color": "C82333",
            "items": [
                ("Ziraat Bankası (ZiraatBank BH)", "Bankacılık Altyapısı, FinTech & Bölgesel Yatırımlar", "CS / IE", "Etkinlik & Afiş Sponsorluğu, İkram Desteği", "https://www.linkedin.com/company/ziraat-bankasi/"),
                ("Turkish Airlines", "Global Havacılık & Ulaşım Devi (Saraybosna Ofisi)", "Tüm FENS", "Konuk Konuşmacı Ulaşım Sponsorluğu", "https://www.linkedin.com/company/turkish-airlines/"),
                ("Natron-Hayat (Hayat Kimya)", "Avrupa'nın En Büyük Ambalaj & Entegre Kâğıt Tesisi", "ME / IE / EE", "Büyük Sanayi Tesisi Gezisi & Stajlar", "https://www.linkedin.com/company/natron-hayat/"),
                ("Şişecam (Soda Lukavac)", "Global Cam & Kimya Sanayi Devi", "ME / IE", "Endüstri Mühendisliği Süreç Eğitimi", "https://www.linkedin.com/company/sisecam/"),
                ("TİKA (Türk İşbirliği Koordinasyon)", "Kalkınma, Eğitim & Gençlik Projeleri", "Tüm FENS", "Laboratuvar Ekipman & Proje Hibeleri", "https://www.linkedin.com/company/tika/"),
                ("Yunus Emre Enstitüsü", "Kültürel & Akademik İş Birlikleri Merkezi", "Tüm FENS", "Kültür & Gençlik Ortak Etkinlikleri", "https://www.linkedin.com/company/yunus-emre-enstitusu/"),
                ("Aselsan", "Savunma, Aviyonik & İleri Elektronik Teknolojileri", "EE / CS / ME", "Teknofest & Savunma Sanayii Mentorluğu", "https://www.linkedin.com/company/aselsan/"),
                ("Havelsan", "Simülasyon, Yapay Zeka & Askeri Yazılım Sistemleri", "CS / EE", "Siber Güvenlik & Simülasyon Semineri", "https://www.linkedin.com/company/havelsan/"),
                ("Baykar Technologies", "İHA/SİHA, Otonom Sistemler & Robotik Teknolojileri", "CS / EE / ME", "Robotik & İHA Atölye Çalışmaları", "https://www.linkedin.com/company/baykar/"),
            ]
        },
        {
            "title": "4. Global Teknoloji Devleri & Hackathon Destekçileri",
            "description": "Teknik altyapı, sertifika programları ve etkinlik ikram destekleri:",
            "color": "28A745",
            "items": [
                ("Microsoft", "Bulut (Azure), AI & Öğrenci Elçisi Programları (MLSA)", "CS / SE", "Azure Bulut Kredileri, Teknik Sertifikalar", "https://www.linkedin.com/company/microsoft/"),
                ("Red Bull", "Dünya Çapında Öğrenci & Spor/Etkinlik Destekçisi", "Tüm FENS", "DevHack 2027 İçecek/Enerji Sponsorluğu", "https://www.linkedin.com/company/red-bull/"),
                ("Oracle", "Veritabanı Altyapısı, Java & Kurumsal Bulut Sistemleri", "CS / SE", "Veritabanı Eğitimleri & Sertifikasyon", "https://www.linkedin.com/company/oracle/"),
                ("Cisco", "Ağ Güvenliği, Network Altyapısı & IoT Sistemleri", "EE / CS", "Cisco Networking Academy Desteği", "https://www.linkedin.com/company/cisco/"),
                ("Google", "Geliştirici Ekosistemleri & GDG Toplulukları", "CS / SE", "GDG On Campus Kurulumu, Teknik Kaynaklar", "https://www.linkedin.com/company/google/"),
            ]
        }
    ]

    for cat in categories:
        h2 = doc.add_paragraph()
        h2.paragraph_format.space_before = Pt(14)
        h2.paragraph_format.space_after = Pt(2)
        r_h2 = h2.add_run(cat["title"])
        r_h2.font.name = "Calibri"
        r_h2.font.size = Pt(13)
        r_h2.font.bold = True
        # Parse hex color
        r = int(cat["color"][0:2], 16)
        g = int(cat["color"][2:4], 16)
        b = int(cat["color"][4:6], 16)
        r_h2.font.color.rgb = RGBColor(r, g, b)

        desc = doc.add_paragraph()
        desc.paragraph_format.space_after = Pt(6)
        r_desc = desc.add_run(cat["description"])
        r_desc.font.name = "Calibri"
        r_desc.font.size = Pt(9.5)
        r_desc.font.italic = True
        r_desc.font.color.rgb = RGBColor(108, 117, 125)

        # Create Table
        # Columns: Firma Adı (1.4 in), Odak / Faaliyet Alanı (2.0 in), Bölüm (0.8 in), Kulüp Fırsatı (1.8 in), LinkedIn Linki (1.0 in)
        col_widths = [Inches(1.3), Inches(1.8), Inches(0.7), Inches(1.8), Inches(1.4)]
        table = doc.add_table(rows=1, cols=5)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        hdr_cells = table.rows[0].cells
        headers = ["Firma Adı", "Faaliyet Alanı", "Bölüm", "Kulüp İçin Fırsat", "LinkedIn Sayfası"]
        for idx, text in enumerate(headers):
            hdr_cells[idx].width = col_widths[idx]
            p = hdr_cells[idx].paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(text)
            run.font.name = "Calibri"
            run.font.size = Pt(9)
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            set_cell_background(hdr_cells[idx], cat["color"])
            set_cell_margins(hdr_cells[idx], top=80, bottom=80, left=100, right=100)

        for row_idx, item in enumerate(cat["items"]):
            name, focus, dept, opp, url = item
            row_cells = table.add_row().cells
            bg_color = "F8F9FA" if row_idx % 2 == 1 else "FFFFFF"

            for c_idx in range(5):
                row_cells[c_idx].width = col_widths[c_idx]
                set_cell_background(row_cells[c_idx], bg_color)
                set_cell_margins(row_cells[c_idx], top=70, bottom=70, left=100, right=100)

            # Cell 0: Name
            p0 = row_cells[0].paragraphs[0]
            p0.paragraph_format.space_before = Pt(2)
            p0.paragraph_format.space_after = Pt(2)
            r0 = p0.add_run(name)
            r0.font.name = "Calibri"
            r0.font.size = Pt(8.5)
            r0.font.bold = True

            # Cell 1: Focus
            p1 = row_cells[1].paragraphs[0]
            p1.paragraph_format.space_before = Pt(2)
            p1.paragraph_format.space_after = Pt(2)
            r1 = p1.add_run(focus)
            r1.font.name = "Calibri"
            r1.font.size = Pt(8.5)

            # Cell 2: Dept
            p2 = row_cells[2].paragraphs[0]
            p2.paragraph_format.space_before = Pt(2)
            p2.paragraph_format.space_after = Pt(2)
            r2 = p2.add_run(dept)
            r2.font.name = "Calibri"
            r2.font.size = Pt(8.5)
            r2.font.bold = True
            r2.font.color.rgb = RGBColor(73, 80, 87)

            # Cell 3: Opportunity
            p3 = row_cells[3].paragraphs[0]
            p3.paragraph_format.space_before = Pt(2)
            p3.paragraph_format.space_after = Pt(2)
            r3 = p3.add_run(opp)
            r3.font.name = "Calibri"
            r3.font.size = Pt(8.5)

            # Cell 4: Direct Link
            p4 = row_cells[4].paragraphs[0]
            p4.paragraph_format.space_before = Pt(2)
            p4.paragraph_format.space_after = Pt(2)
            # Add direct clickable hyperlink
            add_hyperlink(p4, url, f"🔗 {name} Profil", color="0A66C2", underline=True, bold=True)

        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # PAGE BREAK FOR STRATEGY & SCRIPTS
    doc.add_page_break()

    sec_title = doc.add_paragraph()
    sec_title.paragraph_format.space_before = Pt(6)
    sec_title.paragraph_format.space_after = Pt(6)
    r_st = sec_title.add_run("LinkedIn Arama Stratejisi: Kimi Eklemeliyiz?")
    r_st.font.name = "Calibri"
    r_st.font.size = Pt(16)
    r_st.font.bold = True
    r_st.font.color.rgb = RGBColor(10, 102, 194)

    tip_intro = doc.add_paragraph()
    tip_intro.paragraph_format.space_after = Pt(8)
    tip_intro.add_run(
        "Yukarıdaki şirketlerin LinkedIn sayfalarına girdiğinizde 'People' (Kişiler) sekmesine tıklayarak veya arama çubuğunda "
        "aşağıdaki unvanları aratarak doğru karar vericilere doğrudan ulaşabilirsiniz:"
    )

    roles = [
        ("Talent Acquisition Specialist / Technical Recruiter", "Öğrenci stajları, kariyer fuarı katılımları ve şirket tanıtım günlerini organize eden ana kişiler."),
        ("Employer Branding Specialist / Community Manager", "Şirketin marka bilinirliğini üniversitelerde artırmak onların birincil görevidir. Hackathon ve kulüp sponsorluklarına en hızlı bütçe ayıran ekiptir."),
        ("Engineering Manager / CTO / Tech Lead", "Geliştirici ekiplerinin yöneticileridir. Atölye mentorluğu, teknik konuşmacı (Tech-Talk) ve DevHack jüri koltuğu için davet edilecek isimlerdir."),
        ("IUS Mezunları (Alumni Ağı)", "LinkedIn filtrelerinde 'School: International University of Sarajevo' seçerek bu şirketlerde çalışan eski IUS öğrencilerini bulun. Kendi üniversitelerinden gelen kulüp başkanına ve öğrencilere kapıları en hızlı açan kişilerdir.")
    ]

    for role_name, role_desc in roles:
        p_role = doc.add_paragraph(style='List Bullet')
        p_role.paragraph_format.space_after = Pt(3)
        r_rn = p_role.add_run(f"{role_name}: ")
        r_rn.font.bold = True
        r_rn.font.color.rgb = RGBColor(33, 37, 41)
        p_role.add_run(role_desc)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # TEMPLATE MESSAGES
    msg_title = doc.add_paragraph()
    msg_title.paragraph_format.space_before = Pt(8)
    msg_title.paragraph_format.space_after = Pt(6)
    r_mt = msg_title.add_run("Bağlantı Eklerken Gönderilecek Örnek Davet Notları")
    r_mt.font.name = "Calibri"
    r_mt.font.size = Pt(14)
    r_mt.font.bold = True
    r_mt.font.color.rgb = RGBColor(33, 37, 41)

    # Box 1: English
    t_en = doc.add_table(rows=1, cols=1)
    t_en.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_en = t_en.rows[0].cells[0]
    c_en.width = Inches(7.0)
    set_cell_background(c_en, "F0F4F8")
    set_cell_margins(c_en, top=120, bottom=120, left=150, right=150)
    p_en = c_en.paragraphs[0]
    r_ent = p_en.add_run("📌 İngilizce Şablon (Uluslararası & Bosna IT Yöneticileri İçin - 300 Karakter Sınırına Uygun):\n")
    r_ent.font.bold = True
    r_ent.font.color.rgb = RGBColor(10, 102, 194)
    p_en.add_run(
        '"Hello [İsim], I\'m Hasan Kaan, President of the IUS Engineering Club at International University of Sarajevo. '
        'We\'re building bridges between engineering students and tech leaders like [Firma Adı] for upcoming hackathons, '
        'workshops, and keynotes. I\'d love to connect for future collaborations!"'
    )

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Box 2: Turkish
    t_tr = doc.add_table(rows=1, cols=1)
    t_tr.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_tr = t_tr.rows[0].cells[0]
    c_tr.width = Inches(7.0)
    set_cell_background(c_tr, "FFF5F5")
    set_cell_margins(c_tr, top=120, bottom=120, left=150, right=150)
    p_tr = c_tr.paragraphs[0]
    r_trt = p_tr.add_run("📌 Türkçe Şablon (Ziraat, THY ve Türk/Bölgesel Yöneticiler İçin):\n")
    r_trt.font.bold = True
    r_trt.font.color.rgb = RGBColor(192, 41, 43)
    p_tr.add_run(
        '"Merhabalar [İsim] Bey/Hanım, Uluslararası Saraybosna Üniversitesi (IUS) Mühendislik Kulübü Başkanı olarak '
        'sizinle bağlantıda kalmaktan mutluluk duyarım. Kampüsümüzde gerçekleştireceğimiz hackathon ve mühendislik '
        'projelerinde sektör öncüleriyle öğrencilerimizi buluşturmayı hedefliyoruz. İlerleyen süreçte iş birliklerimiz için iletişimde kalmak dileğiyle!"'
    )

    # Footer note
    ft = doc.add_paragraph()
    ft.paragraph_format.space_before = Pt(20)
    ft.paragraph_format.space_after = Pt(0)
    ft.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_ft = ft.add_run("IUS Engineering Club © 2026/2027 | International University of Sarajevo")
    r_ft.font.size = Pt(8.5)
    r_ft.font.color.rgb = RGBColor(140, 140, 140)

    # Save to Desktop IEC - 05_LinkedIn_ve_Sosyal_Medya
    desktop_dir = r"C:\Users\Kaan\Desktop\IEC\05_LinkedIn_ve_Sosyal_Medya"
    os.makedirs(desktop_dir, exist_ok=True)
    desktop_path = os.path.join(desktop_dir, "IUS_Engineering_Club_LinkedIn_Rehberi.docx")
    doc.save(desktop_path)
    print(f"Document successfully created at: {desktop_path}")

    # Also save a copy in workspace export_documents
    ws_export = r"C:\Users\Kaan\.gemini\antigravity-ide\scratch\ius-engineering-events\export_documents\IUS_Engineering_Club_LinkedIn_Rehberi.docx"
    doc.save(ws_export)
    print(f"Workspace backup saved at: {ws_export}")

if __name__ == "__main__":
    create_directory_document()
