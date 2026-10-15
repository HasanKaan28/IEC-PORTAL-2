import os, base64

def generate_interactive_form_editor():
    # Read logo base64
    logo_path = 'assets/ius_logo.png'
    logo_b64 = ''
    if os.path.exists(logo_path):
        with open(logo_path, 'rb') as f:
            logo_b64 = base64.b64encode(f.read()).decode('utf-8')
    
    html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IUS Student Club Registration Form (Form F252) - Interactive Editor</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {{
      --primary: #003366;
      --primary-light: #0284c7;
      --primary-dark: #002244;
      --accent: #2563eb;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #1e293b;
      --text-muted: #64748b;
      --border: #cbd5e1;
      --border-dark: #94a3b8;
      --success: #10b981;
      --radius: 8px;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding-bottom: 60px;
    }}

    /* TOP TOOLBAR - DESKTOP CONTROLS */
    .top-toolbar {{
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }}

    .toolbar-brand {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}

    .toolbar-title {{
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #38bdf8;
    }}

    .toolbar-badge {{
      background: #0284c7;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    .toolbar-actions {{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }}

    .btn {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease-in-out;
      text-decoration: none;
    }}

    .btn-primary {{
      background: #2563eb;
      color: #ffffff;
    }}
    .btn-primary:hover {{
      background: #1d4ed8;
      transform: translateY(-1px);
    }}

    .btn-success {{
      background: #059669;
      color: #ffffff;
    }}
    .btn-success:hover {{
      background: #047857;
      transform: translateY(-1px);
    }}

    .btn-secondary {{
      background: #334155;
      color: #e2e8f0;
    }}
    .btn-secondary:hover {{
      background: #475569;
      color: #ffffff;
    }}

    .btn-outline {{
      background: transparent;
      border: 1px solid #475569;
      color: #cbd5e1;
    }}
    .btn-outline:hover {{
      background: #1e293b;
      color: #ffffff;
      border-color: #94a3b8;
    }}

    .save-status {{
      font-size: 0.8rem;
      color: #10b981;
      font-weight: 500;
      margin-left: 4px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }}

    /* NOTICE BANNER */
    .banner-notice {{
      max-width: 900px;
      margin: 16px auto;
      padding: 12px 20px;
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #1e3a8a;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }}

    /* PAPER CONTAINER (A4 Simulation) */
    .paper-sheet {{
      max-width: 900px;
      margin: 20px auto;
      background: #ffffff;
      padding: 40px 50px;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }}

    /* OFFICIAL HEADER */
    .form-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #003366;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }}

    .header-logo-img {{
      max-height: 70px;
      width: auto;
    }}

    .header-text {{
      text-align: right;
    }}

    .header-text .univ-name {{
      font-size: 1.15rem;
      font-weight: 800;
      color: #003366;
      letter-spacing: -0.01em;
    }}

    .header-text .office-name {{
      font-size: 0.85rem;
      color: #475569;
      font-weight: 500;
    }}

    .form-title {{
      text-align: center;
      font-size: 1.45rem;
      font-weight: 800;
      color: #003366;
      letter-spacing: 0.05em;
      margin: 20px 0 12px;
      text-transform: uppercase;
    }}

    .form-instruction {{
      font-size: 0.82rem;
      color: #334155;
      line-height: 1.5;
      text-align: justify;
      margin-bottom: 24px;
      background: #f8fafc;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }}

    /* TABLES AND INPUTS */
    table.official-table {{
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 0.875rem;
    }}

    table.official-table th, 
    table.official-table td {{
      border: 1px solid #000000;
      padding: 8px 10px;
      vertical-align: middle;
    }}

    table.official-table th {{
      background: #f1f5f9;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      font-size: 0.8rem;
    }}

    .table-section-title {{
      background: #e2e8f0 !important;
      font-weight: 800;
      color: #003366 !important;
      text-align: center;
      font-size: 0.88rem;
      letter-spacing: 0.02em;
    }}

    /* EDITABLE CONTROLS */
    input.editable-field, 
    textarea.editable-field, 
    select.editable-field {{
      width: 100%;
      border: 1px solid transparent;
      background: transparent;
      font-family: inherit;
      font-size: inherit;
      color: inherit;
      padding: 4px 6px;
      border-radius: 4px;
      transition: all 0.15s ease;
    }}

    input.editable-field:hover, 
    textarea.editable-field:hover, 
    select.editable-field:hover {{
      background: #f8fafc;
      border-color: #cbd5e1;
    }}

    input.editable-field:focus, 
    textarea.editable-field:focus, 
    select.editable-field:focus {{
      outline: none;
      background: #ffffff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }}

    textarea.editable-field {{
      resize: vertical;
      min-height: 80px;
      line-height: 1.5;
    }}

    .status-checkbox-group {{
      display: flex;
      gap: 20px;
      align-items: center;
    }}

    .status-checkbox-group label {{
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.88rem;
    }}

    /* CLUB TYPE SELECTION LIST */
    .club-type-section {{
      margin: 18px 0;
    }}

    .section-label {{
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 8px;
      color: #003366;
    }}

    .club-type-item {{
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 8px;
      padding: 6px 10px;
      border-radius: 6px;
      transition: background 0.15s;
    }}

    .club-type-item:hover {{
      background: #f1f5f9;
    }}

    .club-type-item input[type="radio"] {{
      margin-top: 4px;
      cursor: pointer;
      accent-color: #003366;
      transform: scale(1.15);
    }}

    .club-type-item label {{
      cursor: pointer;
      font-size: 0.83rem;
      color: #334155;
    }}

    .club-type-item label strong {{
      color: #0f172a;
    }}

    .signature-box {{
      min-height: 38px;
      border-bottom: 1px dotted #94a3b8;
      display: flex;
      align-items: flex-end;
      color: #94a3b8;
      font-size: 0.8rem;
      font-style: italic;
    }}

    .important-notes {{
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #cbd5e1;
      font-size: 0.8rem;
      color: #475569;
    }}

    .important-notes h4 {{
      font-size: 0.82rem;
      text-transform: uppercase;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }}

    .important-notes ol {{
      padding-left: 20px;
    }}

    .important-notes li {{
      margin-bottom: 4px;
    }}

    .row-delete-btn {{
      background: transparent;
      border: none;
      color: #ef4444;
      font-weight: 800;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0 4px;
      border-radius: 4px;
    }}
    .row-delete-btn:hover {{
      background: #fee2e2;
    }}

    .add-row-container {{
      margin: 8px 0;
      text-align: right;
    }}

    /* PRINT SPECIFIC STYLES */
    @media print {{
      @page {{
        size: A4 portrait;
        margin: 12mm 15mm;
      }}

      body {{
        background: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
      }}

      .top-toolbar, 
      .banner-notice, 
      .add-row-container, 
      .row-delete-btn,
      .no-print {{
        display: none !important;
      }}

      .paper-sheet {{
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }}

      input.editable-field, 
      textarea.editable-field, 
      select.editable-field {{
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
        box-shadow: none !important;
        resize: none !important;
        color: #000000 !important;
      }}

      table.official-table th, 
      table.official-table td {{
        border: 1px solid #000000 !important;
        color: #000000 !important;
      }}

      table.official-table th,
      .table-section-title {{
        background: #f1f5f9 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }}

      .club-type-item {{
        padding: 2px 0 !important;
      }}

      .page-break {{
        page-break-before: always;
      }}
    }}
  </style>
</head>
<body>

  <!-- TOP INTERACTIVE TOOLBAR -->
  <header class="top-toolbar">
    <div class="toolbar-brand">
      <span class="toolbar-title">IUS Form F252 Editor</span>
      <span class="toolbar-badge">Canlı Düzenleyici</span>
      <span id="saveStatus" class="save-status">✓ Kaydedildi</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-outline" onclick="resetToIECDefaults()" title="Varsayılan IUS Engineering Club verilerini doldur">⚡ IEC Doldur</button>
      <button class="btn btn-outline" onclick="clearAllFields()" title="Tüm alanları boşalt">🧹 Formu Temizle</button>
      <button class="btn btn-secondary" onclick="exportDataJSON()" title="Yedek JSON indir">💾 JSON Yedek</button>
      <button class="btn btn-primary" onclick="saveManual()" title="Tarayıcı hafızasına kaydet">💾 Kaydet</button>
      <button class="btn btn-success" onclick="triggerPrint()" title="Yazdır veya PDF olarak kaydet (Ctrl + P)">🖨️ PDF Kaydet / Yazdır</button>
    </div>
  </header>

  <!-- USER NOTICE BANNER -->
  <div class="banner-notice">
    💡 <strong>Kolay Kullanım İpucu:</strong> Bilgisayarınızda Microsoft Word yüklü olmasa bile bu formu tarayıcınızda dilediğiniz gibi düzenleyebilirsiniz. Metinlerin üzerine tıklayarak değiştirebilir, alttaki <strong>"+ Yeni Üye Ekle"</strong> butonuyla satır ekleyebilir, işiniz bittiğinde <strong>"🖨️ PDF Kaydet / Yazdır"</strong> butonuna basarak doğrudan resmi üniversite başvuru PDF'inizi oluşturabilirsiniz. Yapılan tüm değişiklikler otomatik olarak tarayıcınızda saklanır.
  </div>

  <!-- MAIN PAPER FORM (A4) -->
  <main class="paper-sheet" id="formContainer">

    <!-- HEADER WITH IUS LOGO -->
    <div class="form-header">
      <div>
        <img src="data:image/png;base64,{logo_b64}" alt="IUS Logo" class="header-logo-img">
      </div>
      <div class="header-text">
        <div class="univ-name">INTERNATIONAL UNIVERSITY OF SARAJEVO</div>
        <div class="office-name">University Communications Office (UCO) • Form F252</div>
      </div>
    </div>

    <!-- FORM TITLE & INSTRUCTION -->
    <h1 class="form-title">STUDENT CLUB REGISTRATION FORM</h1>
    <div class="form-instruction">
      Please complete this form if you are interested in starting a new or renewing an already existing Student Club. Submit this form to the University Communications Office (UCO) and the president or student club advisor will be informed about the final decision on establishing a student club. If you have any further questions, visit us at the University Communications Office (A G.16).
    </div>

    <!-- TABLE 1: BASIC CLUB IDENTIFICATION -->
    <table class="official-table">
      <tr>
        <th style="width: 35%;">STUDENT CLUB NAME</th>
        <td>
          <input type="text" id="clubName" class="editable-field" style="font-weight: 700; font-size: 0.95rem; color: #003366;" value="IUS Engineering Club">
        </td>
      </tr>
      <tr>
        <th>Status of the Student Club?</th>
        <td>
          <div class="status-checkbox-group">
            <label><input type="radio" name="clubStatus" id="statusNew" value="NEW" checked> NEW</label>
            <label><input type="radio" name="clubStatus" id="statusRenewal" value="RENEWAL"> RENEWAL</label>
          </div>
        </td>
      </tr>
      <tr>
        <th>Academic Year</th>
        <td>
          <input type="text" id="academicYear" class="editable-field" value="2026 / 2027" style="font-weight: 600;">
        </td>
      </tr>
    </table>

    <!-- CLUB TYPE SELECTION -->
    <div class="club-type-section">
      <div class="section-label">Please choose the type of your Student Club:</div>

      <div class="club-type-item">
        <input type="radio" name="clubType" id="type_aec" value="AEC" checked>
        <label for="type_aec"><strong>AEC (Academic and Educational Club):</strong> provides attention, support and recognition to all IUS students toward the high standards of the academic mission at IUS.</label>
      </div>

      <div class="club-type-item">
        <input type="radio" name="clubType" id="type_csc" value="CSC">
        <label for="type_csc"><strong>CSC (Community Service Club):</strong> builds community and creates connections among students at IUS.</label>
      </div>

      <div class="club-type-item">
        <input type="radio" name="clubType" id="type_src" value="SRC">
        <label for="type_src"><strong>SRC (Spiritual and Religious Club):</strong> faith-based societies formed by students who want to stay in touch with students of the same background.</label>
      </div>

      <div class="club-type-item">
        <input type="radio" name="clubType" id="type_cc" value="CC">
        <label for="type_cc"><strong>CC (Cultural Club):</strong> student groups that exist to network with people coming from the same parts of the world, same background, and share a similar culture. The aim is to represent their tradition to other people.</label>
      </div>

      <div class="club-type-item">
        <input type="radio" name="clubType" id="type_rsc" value="RSC">
        <label for="type_rsc"><strong>RSC (Recreation and Sports Club):</strong> activities are organized so students can stay fit, healthy and spend time on their hobbies, sports competitions or in nature.</label>
      </div>

      <div class="club-type-item">
        <input type="radio" name="clubType" id="type_mac" value="MAC">
        <label for="type_mac"><strong>MAC (Media and Art Club):</strong> offer a variety of interesting activities, projects and content for students who would like to exercise and improve their creative skills.</label>
      </div>
    </div>

    <!-- PURPOSE STATEMENT -->
    <table class="official-table">
      <tr>
        <th class="table-section-title">PURPOSE STATEMENT OF THE STUDENT CLUB</th>
      </tr>
      <tr>
        <td>
          <textarea id="purposeStatement" class="editable-field" rows="4">The IUS Engineering Club (IEC) is established as an Academic and Educational Club (AEC) under the Faculty of Engineering and Natural Sciences (FENS) to bridge university engineering education with real-world industrial practice. Through high-impact extracurricular workshops, software/AI bootcamps, multidisciplinary student engineering project teams (spanning Computer Science, Software Engineering, Electrical & Electronics, and Mechanical Engineering), and professional networking with Bosnia and Herzegovina’s leading technology companies, IEC equips IUS students with industry-grade engineering proficiencies, leadership experience, and career acceleration.</textarea>
        </td>
      </tr>
    </table>

    <!-- MANAGEMENT BOARD INFORMATION -->
    <table class="official-table">
      <tr>
        <th colspan="2" class="table-section-title">MANAGEMENT BOARD INFORMATION</th>
      </tr>
      <tr>
        <th style="width: 35%;">TITLE</th>
        <th>NAME AND SURNAME</th>
      </tr>
      <tr>
        <td><strong>Student Club Advisor</strong></td>
        <td><input type="text" id="boardAdvisor" class="editable-field" value="Prof. Dr. Leila Miller" style="font-weight: 600; color: #003366;"></td>
      </tr>
      <tr>
        <td><strong>President</strong></td>
        <td><input type="text" id="boardPresident" class="editable-field" value="Kaan Mete Şenyıldız" style="font-weight: 600;"></td>
      </tr>
      <tr>
        <td><strong>Vice President</strong></td>
        <td><input type="text" id="boardVicePresident" class="editable-field" value="Hasan Kaan / Mahmut İhsan Avcı"></td>
      </tr>
      <tr>
        <td><strong>Secretary</strong></td>
        <td><input type="text" id="boardSecretary" class="editable-field" value="Mahmut İhsan Avcı"></td>
      </tr>
      <tr>
        <td><strong>Treasurer</strong></td>
        <td><input type="text" id="boardTreasurer" class="editable-field" value="Bekir Enes Çokbekler"></td>
      </tr>
      <tr>
        <td><strong>Public Relations (PR)</strong></td>
        <td><input type="text" id="boardPR" class="editable-field" value="Bakir Bašić"></td>
      </tr>
    </table>

    <!-- CONTACT INFORMATION -->
    <table class="official-table">
      <tr>
        <th colspan="2" class="table-section-title">CONTACT INFORMATION</th>
      </tr>
      <tr>
        <th colspan="2" style="background: #f8fafc; font-size: 0.82rem; color: #003366;">STUDENT CLUB PRESIDENT</th>
      </tr>
      <tr>
        <td style="width: 35%;"><strong>Name and Surname</strong></td>
        <td><input type="text" id="presName" class="editable-field" value="Kaan Mete Şenyıldız"></td>
      </tr>
      <tr>
        <td><strong>Phone Number</strong></td>
        <td><input type="text" id="presPhone" class="editable-field" value="+90 553 113 11 98"></td>
      </tr>
      <tr>
        <td><strong>E-mail</strong></td>
        <td><input type="email" id="presEmail" class="editable-field" value="kmsenyildiz@gmail.com"></td>
      </tr>

      <tr>
        <th colspan="2" style="background: #f8fafc; font-size: 0.82rem; color: #003366;">STUDENT CLUB ADVISOR</th>
      </tr>
      <tr>
        <td><strong>Name and Surname</strong></td>
        <td><input type="text" id="advName" class="editable-field" value="Prof. Dr. Leila Miller (Full Professor Dr.)" style="font-weight: 700; color: #003366;"></td>
      </tr>
      <tr>
        <td><strong>Phone Number</strong></td>
        <td><input type="text" id="advPhone" class="editable-field" value="033 957 -" style="font-weight: 600;"></td>
      </tr>
      <tr>
        <td><strong>E-mail</strong></td>
        <td><input type="email" id="advEmail" class="editable-field" value="lmiller@ius.edu.ba" style="font-weight: 600;"></td>
      </tr>
      <tr>
        <td><strong>Assistant(s) / E-mail</strong></td>
        <td><input type="text" id="advAssistant" class="editable-field" value="Ilma Papić (itarhanis-papic@ius.edu.ba)" style="font-weight: 500; color: #334155;"></td>
      </tr>
      <tr>
        <td><strong>Signature</strong></td>
        <td><div class="signature-box">Physical Signature: ________________________________________</div></td>
      </tr>
    </table>

    <div class="page-break"></div>

    <!-- INFORMATION ON CLUB MEMBERS -->
    <table class="official-table" id="membersTable">
      <thead>
        <tr>
          <th colspan="6" class="table-section-title">INFORMATION ON THE CLUB MEMBERS</th>
        </tr>
        <tr>
          <td colspan="6" style="background: #f8fafc; font-size: 0.78rem; font-style: italic; color: #475569;">
            Note: In order to establish a student club, you need at least 10 students, including the Management board.
          </td>
        </tr>
        <tr>
          <th style="width: 5%; text-align: center;">No.</th>
          <th style="width: 28%;">Name and Surname</th>
          <th style="width: 30%;">Email</th>
          <th style="width: 15%;">Student ID</th>
          <th style="width: 18%;">Signature</th>
          <th class="no-print" style="width: 4%;">Sil</th>
        </tr>
      </thead>
      <tbody id="membersTableBody">
        <!-- Dynamically injected or prefilled -->
      </tbody>
    </table>

    <div class="add-row-container no-print">
      <button class="btn btn-outline" onclick="addMemberRow()" style="border-color: #0284c7; color: #0284c7;">+ Yeni Üye Satırı Ekle (+ Add Member)</button>
    </div>

    <!-- APPROVED BY DEAN -->
    <table class="official-table" style="margin-top: 24px;">
      <tr>
        <th colspan="2" class="table-section-title">APPROVED BY</th>
      </tr>
      <tr>
        <th colspan="2" style="background: #f8fafc; font-size: 0.8rem; color: #003366;">
          DEAN OF THE RELEVANT FACULTY (FOR CLUBS RELATED TO STUDY PROGRAMS)
        </th>
      </tr>
      <tr>
        <td style="width: 35%;"><strong>Name and Surname</strong></td>
        <td><input type="text" id="deanName" class="editable-field" value="Prof. / Assoc. Prof. Dean Full Name (FENS)"></td>
      </tr>
      <tr>
        <td><strong>Signature & Stamp</strong></td>
        <td><div class="signature-box">Signature: _________________________________ &nbsp;&nbsp;&nbsp;&nbsp; Date: _____ / _____ / 2026</div></td>
      </tr>
    </table>

    <!-- STUDENT CLUB COMMITTEE -->
    <table class="official-table" style="margin-top: 24px;">
      <tr>
        <th colspan="3" class="table-section-title">STUDENT CLUB COMMITTEE</th>
      </tr>
      <tr>
        <th style="width: 8%; text-align: center;">No.</th>
        <th style="width: 60%;">Name and Surname</th>
        <th style="width: 32%;">Signature</th>
      </tr>
      <tr>
        <td style="text-align: center;">1</td>
        <td>Velida Handžić-Mirica, UCO Manager</td>
        <td><div class="signature-box">_________________________</div></td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td>Asst. Prof. Dr. Özge Büyükdağlı</td>
        <td><div class="signature-box">_________________________</div></td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td>Asst. Prof. Roman Sulejmanpašić</td>
        <td><div class="signature-box">_________________________</div></td>
      </tr>
      <tr>
        <td style="text-align: center;">4</td>
        <td>Assoc. Prof. Dr. Ena Kazić-Çakar</td>
        <td><div class="signature-box">_________________________</div></td>
      </tr>
      <tr>
        <td style="text-align: center;">5</td>
        <td>Asst. Prof. Dr. Mustafa Krupalija</td>
        <td><div class="signature-box">_________________________</div></td>
      </tr>
    </table>

    <!-- IMPORTANT NOTES -->
    <div class="important-notes">
      <h4>IMPORTANT NOTES:</h4>
      <ol>
        <li>Student Club can't start with its activities before Rector signs his approval.</li>
        <li>Report on semiannual activities must be submitted to the University Communications Office (UCO) before the end of each semester.</li>
        <li>Student Club must have all documentation on activities and all Reports on semiannual activities.</li>
      </ol>
    </div>

  </main>

  <script>
    const INITIAL_MEMBERS = [
      {{ no: 1, name: "Kaan Mete Şenyıldız", email: "kmsenyildiz@gmail.com", id: "250302201" }},
      {{ no: 2, name: "Hasan Kaan", email: "ufukkarabulut35@gmail.com", id: "250302195" }},
      {{ no: 3, name: "Mahmut İhsan Avcı", email: "mahmut.ihsanavcii@gmail.com", id: "250302233" }},
      {{ no: 4, name: "Bekir Enes Çokbekler", email: "46bekir70@gmail.com", id: "250302229" }},
      {{ no: 5, name: "Bilal Yusuf Şimşek", email: "Simsekbilal59@gmail.com", id: "250302196" }},
      {{ no: 6, name: "Nazlıcan Cebeci", email: "nazlii.cebeci@gmail.com", id: "250302243" }},
      {{ no: 7, name: "Muhammed Emin", email: "duduck6107@gmail.com", id: "250302247" }},
      {{ no: 8, name: "Emin Efe Duman", email: "emnfdmn@gmail.com", id: "250302211" }},
      {{ no: 9, name: "Bakir Bašić", email: "260302030@student.ius.edu.ba", id: "260302030" }},
      {{ no: 10, name: "Ömer Arif Açıkel", email: "o.arifacikel@gmail.com", id: "250302232" }},
      {{ no: 11, name: "Mert Çınar Atalay", email: "atalayss301@gmail.com", id: "250302162" }},
      {{ no: 12, name: "Ferit Enes Seymenliler", email: "eenesseymenliler@gmail.com", id: "240302180" }},
      {{ no: 13, name: "Hüseyin Talha Seymenliler", email: "tseymenliler16@gmail.com", id: "240302179" }},
      {{ no: 14, name: "Muhammed Efe Ural", email: "uralefe10@gmail.com", id: "240302169" }},
      {{ no: 15, name: "Abdullah Uzun", email: "250201110@student.ius.edu.ba", id: "250201110" }},
      {{ no: 16, name: "Ahmed Hadzimurati", email: "260302051@student.ius.edu.ba", id: "260302051" }},
    ];

    function renderMembers(members) {{
      const tbody = document.getElementById("membersTableBody");
      tbody.innerHTML = "";
      members.forEach((m, idx) => {{
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="text-align: center; font-weight: 600;">${{idx + 1}}</td>
          <td><input type="text" class="editable-field member-name" value="${{m.name || ''}}" placeholder="Name and Surname"></td>
          <td><input type="email" class="editable-field member-email" value="${{m.email || ''}}" placeholder="Email"></td>
          <td><input type="text" class="editable-field member-id" value="${{m.id || ''}}" placeholder="Student ID"></td>
          <td><div class="signature-box">___________________</div></td>
          <td class="no-print" style="text-align: center;">
            <button class="row-delete-btn" onclick="removeMemberRow(this)" title="Satırı Sil">×</button>
          </td>
        `;
        tbody.appendChild(tr);
      }});
      renumberRows();
    }}

    function renumberRows() {{
      const rows = document.querySelectorAll("#membersTableBody tr");
      rows.forEach((tr, idx) => {{
        tr.cells[0].textContent = idx + 1;
      }});
    }}

    function addMemberRow() {{
      const tbody = document.getElementById("membersTableBody");
      const nextNo = tbody.rows.length + 1;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="text-align: center; font-weight: 600;">${{nextNo}}</td>
        <td><input type="text" class="editable-field member-name" placeholder="Name and Surname"></td>
        <td><input type="email" class="editable-field member-email" placeholder="Email"></td>
        <td><input type="text" class="editable-field member-id" placeholder="Student ID"></td>
        <td><div class="signature-box">___________________</div></td>
        <td class="no-print" style="text-align: center;">
          <button class="row-delete-btn" onclick="removeMemberRow(this)" title="Satırı Sil">×</button>
        </td>
      `;
      tbody.appendChild(tr);
      saveToStorage();
    }}

    function removeMemberRow(btn) {{
      const row = btn.closest("tr");
      row.remove();
      renumberRows();
      saveToStorage();
    }}

    function triggerPrint() {{
      saveToStorage();
      window.print();
    }}

    function saveToStorage() {{
      const data = {{
        clubName: document.getElementById("clubName").value,
        academicYear: document.getElementById("academicYear").value,
        clubStatus: document.querySelector('input[name="clubStatus"]:checked')?.value || 'NEW',
        clubType: document.querySelector('input[name="clubType"]:checked')?.value || 'AEC',
        purposeStatement: document.getElementById("purposeStatement").value,
        boardAdvisor: document.getElementById("boardAdvisor").value,
        boardPresident: document.getElementById("boardPresident").value,
        boardVicePresident: document.getElementById("boardVicePresident").value,
        boardSecretary: document.getElementById("boardSecretary").value,
        boardTreasurer: document.getElementById("boardTreasurer").value,
        boardPR: document.getElementById("boardPR").value,
        presName: document.getElementById("presName").value,
        presPhone: document.getElementById("presPhone").value,
        presEmail: document.getElementById("presEmail").value,
        advName: document.getElementById("advName").value,
        advPhone: document.getElementById("advPhone").value,
        advEmail: document.getElementById("advEmail").value,
        advAssistant: document.getElementById("advAssistant") ? document.getElementById("advAssistant").value : "Ilma Papić (itarhanis-papic@ius.edu.ba)",
        deanName: document.getElementById("deanName").value,
        members: []
      }};

      const rows = document.querySelectorAll("#membersTableBody tr");
      rows.forEach(tr => {{
        data.members.push({{
          name: tr.querySelector(".member-name")?.value || "",
          email: tr.querySelector(".member-email")?.value || "",
          id: tr.querySelector(".member-id")?.value || ""
        }});
      }});

      localStorage.setItem("ius_club_form_f252_data", JSON.stringify(data));
      showSaveIndicator();
    }}

    function showSaveIndicator() {{
      const indicator = document.getElementById("saveStatus");
      indicator.textContent = "✓ Kaydedildi";
      indicator.style.opacity = "1";
      setTimeout(() => {{
        indicator.style.opacity = "0.7";
      }}, 1500);
    }}

    function loadFromStorage() {{
      const saved = localStorage.getItem("ius_club_form_f252_data");
      if (!saved) {{
        renderMembers(INITIAL_MEMBERS);
        return;
      }}
      try {{
        const data = JSON.parse(saved);
        if (data.clubName) document.getElementById("clubName").value = data.clubName;
        if (data.academicYear) document.getElementById("academicYear").value = data.academicYear;
        if (data.clubStatus) {{
          const radio = document.querySelector(`input[name="clubStatus"][value="${{data.clubStatus}}"]`);
          if (radio) radio.checked = true;
        }}
        if (data.clubType) {{
          const radio = document.querySelector(`input[name="clubType"][value="${{data.clubType}}"]`);
          if (radio) radio.checked = true;
        }}
        if (data.purposeStatement) document.getElementById("purposeStatement").value = data.purposeStatement;
        
        // Advisor fields check - always enforce Prof. Dr. Leila Miller if empty or placeholder
        if (!data.boardAdvisor || data.boardAdvisor.includes("Full Name") || data.boardAdvisor.includes("[")) {{
          data.boardAdvisor = "Prof. Dr. Leila Miller";
        }}
        document.getElementById("boardAdvisor").value = data.boardAdvisor;

        if (data.boardPresident) document.getElementById("boardPresident").value = data.boardPresident;
        if (data.boardVicePresident) document.getElementById("boardVicePresident").value = data.boardVicePresident;
        if (data.boardSecretary) document.getElementById("boardSecretary").value = data.boardSecretary;
        if (data.boardTreasurer) document.getElementById("boardTreasurer").value = data.boardTreasurer;
        if (data.boardPR) document.getElementById("boardPR").value = data.boardPR;
        if (data.presName) document.getElementById("presName").value = data.presName;
        if (data.presPhone) document.getElementById("presPhone").value = data.presPhone;
        if (data.presEmail) document.getElementById("presEmail").value = data.presEmail;

        if (!data.advName || data.advName.includes("Full Name") || data.advName.includes("[")) {{
          data.advName = "Prof. Dr. Leila Miller (Full Professor Dr.)";
        }}
        document.getElementById("advName").value = data.advName;

        if (!data.advPhone || data.advPhone.includes("000")) {{
          data.advPhone = "033 957 -";
        }}
        document.getElementById("advPhone").value = data.advPhone;

        if (!data.advEmail || data.advEmail.includes("advisor@")) {{
          data.advEmail = "lmiller@ius.edu.ba";
        }}
        document.getElementById("advEmail").value = data.advEmail;

        if (document.getElementById("advAssistant")) {{
          document.getElementById("advAssistant").value = data.advAssistant || "Ilma Papić (itarhanis-papic@ius.edu.ba)";
        }}

        if (data.deanName) document.getElementById("deanName").value = data.deanName;

        if (Array.isArray(data.members) && data.members.length > 0) {{
          renderMembers(data.members);
        }} else {{
          renderMembers(INITIAL_MEMBERS);
        }}
      }} catch (e) {{
        console.error("Storage load error:", e);
        renderMembers(INITIAL_MEMBERS);
      }}
    }}

    function saveManual() {{
      saveToStorage();
      alert("Tüm form verileri tarayıcınızın yerel hafızasına başarıyla kaydedildi!");
    }}

    function resetToIECDefaults() {{
      if (confirm("Formu varsayılan IUS Engineering Club verileriyle sıfırlamak istiyor musunuz?")) {{
        localStorage.removeItem("ius_club_form_f252_data");
        location.reload();
      }}
    }}

    function clearAllFields() {{
      if (confirm("Tüm alanları boşaltıp sıfır bir form oluşturmak istiyor musunuz?")) {{
        document.querySelectorAll("input.editable-field, textarea.editable-field").forEach(el => el.value = "");
        const emptyMembers = Array.from({{length: 10}}, (_, i) => ({{ no: i + 1, name: "", email: "", id: "" }}));
        renderMembers(emptyMembers);
        saveToStorage();
      }}
    }}

    function exportDataJSON() {{
      saveToStorage();
      const saved = localStorage.getItem("ius_club_form_f252_data");
      const blob = new Blob([saved], {{ type: "application/json" }});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ius_club_registration_form_data.json";
      a.click();
      URL.revokeObjectURL(url);
    }}

    // Auto-save on input changes
    document.addEventListener("DOMContentLoaded", () => {{
      loadFromStorage();
      document.body.addEventListener("input", () => {{
        saveToStorage();
      }});
      document.body.addEventListener("change", () => {{
        saveToStorage();
      }});
    }});
  </script>
</body>
</html>
'''
    return html_content

if __name__ == '__main__':
    html = generate_interactive_form_editor()
    
    # 1. Save to export_documents
    export_path = 'export_documents/IUS_Student_Club_Registration_Form_F252_Editor.html'
    os.makedirs('export_documents', exist_ok=True)
    with open(export_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Saved: {export_path}')

