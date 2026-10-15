/**
 * ==============================================================================
 * IUS ENGINEERING CLUB — AUTOMATED CERTIFICATE SYSTEM (IEC AutoCert Engine)
 * ==============================================================================
 * 
 * Bu Google Apps Script motoru, IUS Engineering Club'ın tüm etkinliklerinde 
 * (workshoplar, seminerler, hackathonlar vb.) katılımcıların sertifikalarını 
 * 7/24 Google Bulut altyapısında otomatik olarak üretip katılımcıların e-postalarına 
 * kişiselleştirilmiş ve ekli PDF olarak ulaştırır.
 * 
 * ÖZELLİKLER:
 * 1. 7/24 Bulut Otomasyonu: Hiçbir bilgisayarın açık kalmasına gerek yoktur.
 * 2. İki Çalışma Modu:
 *    - Mod A: Katılımcı formu doldurur doldurmaz anında otomatik gönderim (onFormSubmit Trigger).
 *    - Mod B: Yönetim Kurulu toplu onay ve tek tıkla gönderim (Custom Menu Batch Dispatch).
 * 3. Çift Gönderim Koruması: Zaten gönderilen kişilere tekrar mail atmaz.
 * 4. LinkedIn "Add to Profile" Entegrasyonu: Mail içerisindeki butonla tek tıkla LinkedIn lisanslarına eklenir.
 * 5. Google Drive Arşivi: Her üretilen PDF'i otomatik olarak Drive klasörüne kaydeder.
 * 6. Google Slides veya HTML-PDF Desteği: Slide ID ile görsel tasarım veya saf HTML render.
 * 
 * ==============================================================================
 */

// ======================= KULÜP RESMİ YAPILANDIRMASI =======================
const IEC_CONFIG = {
  // Etkinlik Bilgileri (Her etkinlikte burayı güncellemeniz yeterlidir)
  DEFAULT_EVENT_TITLE: "Modern AI & Prompt Engineering Workshop",
  DEFAULT_EVENT_DATE: "October 2026",
  DEFAULT_EVENT_CODE: "AI01", // Sertifika ID prefixi için (Örn: IEC-2026-AI01-001)

  // Kulüp ve Danışman İsimleri
  ISSUER_ORGANIZATION: "IUS Engineering Club",
  UNIVERSITY_NAME: "International University of Sarajevo (FENS)",
  ACADEMIC_ADVISOR: "Prof. Dr. Leila Miller",
  ADVISOR_TITLE: "Faculty Academic Advisor, FENS",
  PRESIDENT_NAME: "Hasan Kaan",
  PRESIDENT_TITLE: "President & Co-Founder, IUS Engineering Club",

  // Doğrulama Web Sitesi (GitHub Pages Public Portal)
  VERIFICATION_BASE_URL: "https://hasankaan28.github.io/ius-engineering-events-site/verify/",

  // Drive Klasör Adı (PDF sertifikaların yedekleneceği klasör)
  DRIVE_FOLDER_NAME: "IEC_Event_Certificates_Archive",

  // Google Slide Şablon ID'si (Google Drive'daki Slide şablonunun ID'si - Opsiyonel)
  // Boş bırakılırsa sistem yerleşik lüks HTML-to-PDF motorunu kullanır!
  SLIDE_TEMPLATE_ID: "", 

  // E-posta Gönderen Başlığı
  SENDER_NAME: "IUS Engineering Club | Certificates Office",
  REPLY_TO_EMAIL: "lmiller@ius.edu.ba" // veya kulüp resmi maili
};

// ======================= GOOGLE SHEETS MENÜ ENTEGRASYONU =======================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🎓 IEC Sertifika Sistemi")
    .addItem("🚀 Bekleyen Tüm Sertifikaları Gönder (Batch Dispatch)", "menuDispatchAllPending")
    .addItem("🎯 Seçili Satırdaki Katılımcıya Gönder", "menuDispatchSelectedRow")
    .addSeparator()
    .addItem("🧪 Test Sertifikası Gönder (Kendime Mail At)", "menuSendTestCertificate")
    .addItem("📊 Günlük Kalan E-posta Kotasını Göster", "menuCheckEmailQuota")
    .addSeparator()
    .addItem("⚙️ Başlık Satırlarını ve Sütunları Otomatik Hazırla", "menuSetupSheetHeaders")
    .addToUi();
}

/**
 * Sayfa sütun başlıklarını kontrol eder veya otomatik olarak formatlar.
 */
function menuSetupSheetHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = [
    "Timestamp", 
    "Full Name", 
    "Email Address", 
    "Department / Major", 
    "Feedback", 
    "Certificate ID", 
    "Status", 
    "Sent Timestamp", 
    "PDF Drive Link"
  ];
  
  const currentHeaderRange = sheet.getRange(1, 1, 1, headers.length);
  const currentValues = currentHeaderRange.getValues()[0];
  
  if (!currentValues[0] || currentValues[0] === "") {
    currentHeaderRange.setValues([headers]);
    currentHeaderRange.setBackground("#0F172A").setFontColor("#F8FAFC").setFontWeight("bold");
    sheet.setFrozenRows(1);
    SpreadsheetApp.getUi().alert("✅ Sütun başlıkları başarıyla oluşturuldu!");
  } else {
    // Sütunların sonuna eksik olan Sertifika ID, Status, Sent Timestamp, PDF Drive Link sütunlarını ekle
    const lastCol = sheet.getLastColumn();
    const existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    const requiredExtra = ["Certificate ID", "Status", "Sent Timestamp", "PDF Drive Link"];
    let added = 0;
    
    requiredExtra.forEach(colName => {
      if (!existingHeaders.includes(colName)) {
        sheet.getRange(1, lastCol + 1 + added).setValue(colName)
             .setBackground("#0F172A").setFontColor("#F8FAFC").setFontWeight("bold");
        added++;
      }
    });
    
    SpreadsheetApp.getUi().alert("✅ Mevcut başlıklar kontrol edildi ve eksik kontrol sütunları eklendi!");
  }
}

/**
 * Kalan e-posta kotasını kullanıcıya gösterir.
 */
function menuCheckEmailQuota() {
  const quota = MailApp.getRemainingDailyQuota();
  SpreadsheetApp.getUi().alert(
    "📊 E-posta Gönderim Kotası:\n\n" +
    "Bugün kalan gönderim hakkınız: " + quota + " adet e-posta.\n" +
    "(Kişisel Gmail: ~100/gün, IUS Google Workspace: ~1500/gün)"
  );
}

/**
 * Yöneticiye test amaçlı tek bir sertifika gönderir.
 */
function menuSendTestCertificate() {
  const userEmail = Session.getActiveUser().getEmail();
  if (!userEmail) {
    SpreadsheetApp.getUi().alert("Lütfen aktif oturum açmış bir e-posta ile deneyin.");
    return;
  }
  
  const testData = {
    fullName: "Kaan Mete Şenyıldız (Test)",
    email: userEmail,
    eventTitle: IEC_CONFIG.DEFAULT_EVENT_TITLE,
    eventDate: IEC_CONFIG.DEFAULT_EVENT_DATE,
    certId: "IEC-TEST-2026-0001",
    dept: "Computer Science & Engineering"
  };
  
  const result = generateAndSendCertificate(testData);
  if (result.success) {
    SpreadsheetApp.getUi().alert("🎉 Test sertifikası başarıyla " + userEmail + " adresine gönderildi!");
  } else {
    SpreadsheetApp.getUi().alert("❌ Test gönderimi başarısız oldu:\n" + result.error);
  }
}

/**
 * Tabloda seçili satırdaki katılımcıya sertifika gönderir.
 */
function menuDispatchSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rowIndex = sheet.getActiveCell().getRow();
  
  if (rowIndex <= 1) {
    SpreadsheetApp.getUi().alert("Lütfen başlık satırı dışında geçerli bir katılımcı satırı seçin.");
    return;
  }
  
  processRow(sheet, rowIndex);
  SpreadsheetApp.getUi().alert("✅ Seçili satır işlendi!");
}

/**
 * Tabloda "Status" sütunu boş olan veya "PENDING" olan tüm satırları sırayla gönderir.
 */
function menuDispatchAllPending() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert("İşlenecek katılımcı verisi bulunamadı.");
    return;
  }
  
  const colMap = getColumnMapping(sheet);
  if (!colMap.email || !colMap.name) {
    SpreadsheetApp.getUi().alert("❌ Hata: 'Full Name' ve 'Email Address' sütunları tespit edilemedi. Lütfen başlıkları kontrol edin.");
    return;
  }
  
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  let sentCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < data.length; i++) {
    const rowNum = i + 2;
    const row = data[i];
    const status = colMap.status ? row[colMap.status - 1] : "";
    
    // Zaten gönderilmişse atla
    if (status && (status.toString().toUpperCase() === "SENT" || status.toString().toUpperCase() === "DELIVERED")) {
      skippedCount++;
      continue;
    }
    
    const email = row[colMap.email - 1];
    const name = row[colMap.name - 1];
    
    if (email && email.toString().includes("@") && name) {
      processRow(sheet, rowNum, colMap);
      sentCount++;
      Utilities.sleep(1000); // Gmail spam filtresi ve hız limiti koruması (1 sn bekleme)
    }
  }
  
  SpreadsheetApp.getUi().alert(
    "🎉 Gönderim Tamamlandı!\n\n" +
    "✅ Başarıyla Gönderilen: " + sentCount + "\n" +
    "⏭️ Zaten Gönderildiği İçin Atlanan: " + skippedCount
  );
}

/**
 * Google Form submit trigger olduğunda otomatik çalışır.
 */
function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    processRow(sheet, lastRow);
  } catch (err) {
    console.error("onFormSubmit Hatası: " + err.toString());
  }
}

/**
 * Belirli bir satırdaki katılımcıyı işler, sertifikasını basar, mail atar ve sheet'i günceller.
 */
function processRow(sheet, rowNum, colMap) {
  colMap = colMap || getColumnMapping(sheet);
  
  const rowValues = sheet.getRange(rowNum, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const fullName = rowValues[colMap.name - 1];
  const email = rowValues[colMap.email - 1];
  const dept = colMap.dept ? rowValues[colMap.dept - 1] : "FENS Engineering";
  
  if (!email || !email.toString().includes("@") || !fullName) {
    return;
  }
  
  // Benzersiz Sertifika ID Üretimi: IEC-2026-AI01-0042
  const paddedId = String(rowNum - 1).padStart(4, '0');
  const certId = `IEC-2026-${IEC_CONFIG.DEFAULT_EVENT_CODE}-${paddedId}`;
  
  const participantData = {
    fullName: fullName.toString().trim(),
    email: email.toString().trim(),
    eventTitle: IEC_CONFIG.DEFAULT_EVENT_TITLE,
    eventDate: IEC_CONFIG.DEFAULT_EVENT_DATE,
    certId: certId,
    dept: dept.toString().trim()
  };
  
  const result = generateAndSendCertificate(participantData);
  
  // Sheet'i güncelle
  if (result.success) {
    if (colMap.certId) sheet.getRange(rowNum, colMap.certId).setValue(certId);
    if (colMap.status) sheet.getRange(rowNum, colMap.status).setValue("SENT");
    if (colMap.sentAt) sheet.getRange(rowNum, colMap.sentAt).setValue(new Date());
    if (colMap.driveLink) sheet.getRange(rowNum, colMap.driveLink).setValue(result.driveUrl);
  } else {
    if (colMap.status) sheet.getRange(rowNum, colMap.status).setValue("ERROR: " + result.error);
  }
}

/**
 * Sertifikayı oluşturur ve e-posta ile gönderir.
 */
function generateAndSendCertificate(data) {
  try {
    // 1. Google Drive Klasörünü Bul veya Oluştur
    const folder = getOrCreateFolder(IEC_CONFIG.DRIVE_FOLDER_NAME);
    
    // 2. PDF Sertifika Blobunu Üret (HTML veya Slide)
    let pdfBlob;
    if (IEC_CONFIG.SLIDE_TEMPLATE_ID && IEC_CONFIG.SLIDE_TEMPLATE_ID.trim() !== "") {
      pdfBlob = generatePdfFromSlide(data);
    } else {
      pdfBlob = generatePdfFromHtml(data);
    }
    
    pdfBlob.setName(`Certificate_${data.fullName.replace(/\s+/g, '_')}_${data.certId}.pdf`);
    
    // 3. Drive'a Kaydet
    const driveFile = folder.createFile(pdfBlob);
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const driveUrl = driveFile.getUrl();
    
    // 4. LinkedIn Doğrulama Bağlantısı
    const verifyUrl = `${IEC_CONFIG.VERIFICATION_BASE_URL}?id=${encodeURIComponent(data.certId)}&name=${encodeURIComponent(data.fullName)}&event=${encodeURIComponent(data.eventTitle)}`;
    
    const linkedInAddUrl = "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME" +
      "&name=" + encodeURIComponent(data.eventTitle) +
      "&organizationName=" + encodeURIComponent(IEC_CONFIG.ISSUER_ORGANIZATION) +
      "&issueYear=2026" +
      "&issueMonth=10" +
      "&certUrl=" + encodeURIComponent(verifyUrl) +
      "&certId=" + encodeURIComponent(data.certId);
      
    // 5. HTML E-Posta Şablonunu Hazırla
    const emailSubject = `🎓 Your Official Certificate of Participation — ${data.eventTitle} | IUS Engineering Club`;
    const emailHtmlBody = createEmailHtml(data, verifyUrl, linkedInAddUrl);
    
    // 6. Gmail ile Gönder
    GmailApp.sendEmail(data.email, emailSubject, "", {
      name: IEC_CONFIG.SENDER_NAME,
      htmlBody: emailHtmlBody,
      replyTo: IEC_CONFIG.REPLY_TO_EMAIL,
      attachments: [pdfBlob]
    });
    
    return { success: true, driveUrl: driveUrl };
  } catch (err) {
    console.error("Sertifika Gönderim Hatası: " + err.toString());
    return { success: false, error: err.toString() };
  }
}

/**
 * Katılımcı için lüks HTML e-posta gövdesi oluşturur.
 */
function createEmailHtml(data, verifyUrl, linkedInAddUrl) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f1f5f9; margin: 0; padding: 20px; }
      .container { max-width: 620px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
      .header { background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%); padding: 36px 30px; text-align: center; border-bottom: 2px solid #d4af37; }
      .header h1 { margin: 0; font-size: 24px; color: #ffffff; letter-spacing: 1px; font-weight: 800; text-transform: uppercase; }
      .header p { margin: 8px 0 0; color: #94a3b8; font-size: 13px; letter-spacing: 2px; }
      .badge { display: inline-block; background: rgba(212, 175, 55, 0.15); color: #f59e0b; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: 1px solid rgba(212, 175, 55, 0.4); margin-top: 14px; }
      .content { padding: 32px 30px; line-height: 1.6; color: #cbd5e1; font-size: 15px; }
      .greeting { font-size: 18px; font-weight: 700; color: #f8fafc; margin-bottom: 12px; }
      .cert-box { background: #1e293b; border-left: 4px solid #38bdf8; border-radius: 8px; padding: 18px 20px; margin: 24px 0; }
      .cert-title { font-size: 16px; font-weight: 700; color: #38bdf8; margin: 0 0 6px 0; }
      .cert-meta { font-size: 13px; color: #94a3b8; margin: 2px 0; }
      .btn-container { text-align: center; margin: 30px 0; }
      .btn-linkedin { display: inline-block; background: #0a66c2; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(10, 102, 194, 0.4); transition: all 0.2s; }
      .btn-verify { display: inline-block; background: transparent; color: #94a3b8 !important; text-decoration: underline; margin-top: 12px; font-size: 13px; }
      .footer { background: #090d16; padding: 24px 30px; text-align: center; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; }
      .footer a { color: #38bdf8; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <p>INTERNATIONAL UNIVERSITY OF SARAJEVO • FENS</p>
        <h1>IUS ENGINEERING CLUB</h1>
        <div class="badge">OFFICIAL CERTIFICATION OFFICE</div>
      </div>
      
      <div class="content">
        <div class="greeting">Dear ${data.fullName},</div>
        <p>Congratulations! On behalf of the <strong>IUS Engineering Club</strong> and the <strong>Faculty of Engineering and Natural Sciences (FENS)</strong>, we are delighted to present your official <strong>Certificate of Participation</strong>.</p>
        
        <p>Your active engagement, dedication to practical engineering, and technical contribution during our workshop have been exemplary.</p>
        
        <div class="cert-box">
          <div class="cert-title">📜 ${data.eventTitle}</div>
          <div class="cert-meta"><strong>Recipient:</strong> ${data.fullName}</div>
          <div class="cert-meta"><strong>Credential ID:</strong> <code>${data.certId}</code></div>
          <div class="cert-meta"><strong>Date of Issuance:</strong> ${data.eventDate}</div>
          <div class="cert-meta"><strong>Faculty Academic Advisor:</strong> ${IEC_CONFIG.ACADEMIC_ADVISOR}</div>
        </div>
        
        <p>Your high-resolution PDF certificate is attached to this email. You can safely save it to your records or print it.</p>
        
        <div class="btn-container">
          <a href="${linkedInAddUrl}" target="_blank" class="btn-linkedin">
            🚀 Add to LinkedIn Licenses & Certifications
          </a>
          <br>
          <a href="${verifyUrl}" target="_blank" class="btn-verify">
            🔍 Verify Credential Online (IEC Observatory)
          </a>
        </div>
        
        <p style="font-size: 13px; color: #94a3b8;">Stay connected with our community for upcoming tech bootcamps, hackathons, and industrial networking events.</p>
      </div>
      
      <div class="footer">
        <p>© 2026 IUS Engineering Club • International University of Sarajevo<br>
        Hrasnička Cesta 15, Ilidža 71210, Sarajevo, Bosnia and Herzegovina<br>
        Official Community: <a href="https://chat.whatsapp.com/LKMpyfm7K5R3F0rXezcXXN">WhatsApp Group</a> • 
        <a href="https://hasankaan28.github.io/ius-engineering-events/">Live Club Observatory</a></p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Standalone HTML şablonundan yüksek kaliteli PDF blob üretir.
 */
function generatePdfFromHtml(data) {
  const verifyUrl = `${IEC_CONFIG.VERIFICATION_BASE_URL}?id=${encodeURIComponent(data.certId)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@400;500;600;700&family=Pinyon+Script&display=swap" rel="stylesheet">
    <style>
      @page { size: A4 landscape; margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 20px;
        background-color: #0b1120;
        font-family: 'Montserrat', sans-serif;
        color: #0f172a;
        -webkit-print-color-adjust: exact;
      }
      .cert-card {
        width: 100%;
        height: 100%;
        min-height: 680px;
        background: #ffffff;
        border: 12px solid #0f172a;
        outline: 3px solid #d4af37;
        outline-offset: -8px;
        position: relative;
        padding: 40px 50px;
        text-align: center;
        box-shadow: 0 0 20px rgba(0,0,0,0.2);
      }
      .corner-ornament {
        position: absolute;
        width: 40px;
        height: 40px;
        border-color: #d4af37;
      }
      .top-left { top: 12px; left: 12px; border-top: 3px solid #d4af37; border-left: 3px solid #d4af37; }
      .top-right { top: 12px; right: 12px; border-top: 3px solid #d4af37; border-right: 3px solid #d4af37; }
      .bottom-left { bottom: 12px; left: 12px; border-bottom: 3px solid #d4af37; border-left: 3px solid #d4af37; }
      .bottom-right { bottom: 12px; right: 12px; border-bottom: 3px solid #d4af37; border-right: 3px solid #d4af37; }
      
      .top-institution {
        font-family: 'Cinzel', serif;
        font-size: 13px;
        letter-spacing: 3px;
        color: #475569;
        text-transform: uppercase;
        margin-bottom: 4px;
        font-weight: 700;
      }
      .club-title {
        font-family: 'Cinzel', serif;
        font-size: 26px;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: 2px;
        margin-bottom: 16px;
      }
      .gold-divider {
        width: 180px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #d4af37, transparent);
        margin: 0 auto 20px auto;
      }
      .cert-heading {
        font-family: 'Cinzel', serif;
        font-size: 32px;
        font-weight: 800;
        color: #d4af37;
        letter-spacing: 4px;
        text-transform: uppercase;
        margin: 10px 0;
      }
      .presented-text {
        font-size: 13px;
        color: #64748b;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-top: 15px;
      }
      .recipient-name {
        font-family: 'Cinzel', serif;
        font-size: 36px;
        font-weight: 900;
        color: #0f172a;
        margin: 12px 0;
        text-decoration: underline;
        text-decoration-color: #d4af37;
        text-underline-offset: 8px;
      }
      .description-text {
        font-size: 14px;
        line-height: 1.6;
        color: #334155;
        max-width: 720px;
        margin: 15px auto 25px auto;
      }
      .event-name-highlight {
        font-weight: 700;
        color: #0f172a;
      }
      .signatures-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 35px;
        padding: 0 40px;
      }
      .sig-block {
        width: 240px;
        text-align: center;
      }
      .sig-line {
        border-top: 1.5px solid #0f172a;
        margin-bottom: 8px;
      }
      .sig-name {
        font-family: 'Cinzel', serif;
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
      }
      .sig-title {
        font-size: 11px;
        color: #64748b;
        line-height: 1.3;
      }
      .center-seal-block {
        text-align: center;
        width: 140px;
      }
      .qr-code {
        width: 68px;
        height: 68px;
        border: 1px solid #cbd5e1;
        padding: 2px;
        margin-bottom: 4px;
      }
      .cert-id-tag {
        font-family: monospace;
        font-size: 10px;
        color: #64748b;
        letter-spacing: 1px;
      }
    </style>
  </head>
  <body>
    <div class="cert-card">
      <div class="corner-ornament top-left"></div>
      <div class="corner-ornament top-right"></div>
      <div class="corner-ornament bottom-left"></div>
      <div class="corner-ornament bottom-right"></div>
      
      <div class="top-institution">International University of Sarajevo • FENS</div>
      <div class="club-title">IUS ENGINEERING CLUB</div>
      <div class="gold-divider"></div>
      
      <div class="cert-heading">Certificate of Participation</div>
      <div class="presented-text">This is proudly awarded to</div>
      
      <div class="recipient-name">${data.fullName}</div>
      
      <div class="description-text">
        for active engagement and successful completion of the university engineering workshop titled<br>
        <strong class="event-name-highlight">"${data.eventTitle}"</strong><br>
        held at the International University of Sarajevo campus in ${data.eventDate}, demonstrating technical skill advancement, innovative problem solving, and commitment to multidisciplinary engineering.
      </div>
      
      <div class="signatures-row">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${IEC_CONFIG.ACADEMIC_ADVISOR}</div>
          <div class="sig-title">${IEC_CONFIG.ADVISOR_TITLE}</div>
        </div>
        
        <div class="center-seal-block">
          <img class="qr-code" src="${qrCodeUrl}" alt="Verification QR">
          <div class="cert-id-tag">${data.certId}</div>
        </div>
        
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${IEC_CONFIG.PRESIDENT_NAME}</div>
          <div class="sig-title">${IEC_CONFIG.PRESIDENT_TITLE}</div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(1123)
    .setHeight(794);
    
  return htmlOutput.getAs('application/pdf');
}

/**
 * Google Slides şablonu kullanarak PDF üretir (Opsiyonel alternatif)
 */
function generatePdfFromSlide(data) {
  const templateFile = DriveApp.getFileById(IEC_CONFIG.SLIDE_TEMPLATE_ID);
  const copyFile = templateFile.makeCopy(`Temp_${data.certId}`, DriveApp.getRootFolder());
  const copyId = copyFile.getId();
  const slide = SlidesApp.openById(copyId);
  
  // Yer tutucuları değiştir
  slide.replaceAllText("{{FULL_NAME}}", data.fullName);
  slide.replaceAllText("{{EVENT_TITLE}}", data.eventTitle);
  slide.replaceAllText("{{EVENT_DATE}}", data.eventDate);
  slide.replaceAllText("{{CERT_ID}}", data.certId);
  slide.replaceAllText("{{ADVISOR_NAME}}", IEC_CONFIG.ACADEMIC_ADVISOR);
  slide.replaceAllText("{{PRESIDENT_NAME}}", IEC_CONFIG.PRESIDENT_NAME);
  
  slide.saveAndClose();
  
  const pdfBlob = copyFile.getAs('application/pdf');
  copyFile.setTrashed(true); // Geçici sunumu sil
  
  return pdfBlob;
}

/**
 * İsmi verilen Google Drive klasörünü bulur veya oluşturur.
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

/**
 * Google Sheet sütun başlıklarını dinamik olarak haritalar.
 */
function getColumnMapping(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return {};
  
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  
  headers.forEach((h, index) => {
    const headerStr = h ? h.toString().toLowerCase().trim() : "";
    const colNum = index + 1;
    
    if (headerStr.includes("name") || headerStr.includes("ad soyad") || headerStr.includes("katılımcı") || headerStr.includes("participant")) {
      map.name = colNum;
    } else if (headerStr.includes("email") || headerStr.includes("e-posta") || headerStr.includes("mail")) {
      map.email = colNum;
    } else if (headerStr.includes("department") || headerStr.includes("bölüm") || headerStr.includes("major")) {
      map.dept = colNum;
    } else if (headerStr.includes("certificate id") || headerStr.includes("cert id") || headerStr.includes("sertifika no")) {
      map.certId = colNum;
    } else if (headerStr.includes("status") || headerStr.includes("durum")) {
      map.status = colNum;
    } else if (headerStr.includes("sent timestamp") || headerStr.includes("tarih") || headerStr.includes("gönderim")) {
      map.sentAt = colNum;
    } else if (headerStr.includes("pdf drive link") || headerStr.includes("drive link") || headerStr.includes("link")) {
      map.driveLink = colNum;
    }
  });
  
  return map;
}
