/**
 * High-Converting, Production-Grade HTML Email Templates
 * Compatible with Supabase Auth, Resend, SendGrid, and Nodemailer.
 */

export type EmailTemplateKey =
  | "welcome"
  | "application_approved"
  | "event_reminder"
  | "certificate_issued";

export interface EmailTemplateData {
  recipientName: string;
  recipientEmail?: string;
  actionUrl?: string;
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  certificateCode?: string;
  trainingHours?: number;
}

export function renderEmailTemplate(
  templateKey: EmailTemplateKey,
  data: EmailTemplateData
): { subject: string; html: string } {
  const primaryBg = "#0c0810";
  const cardBg = "#0f172a";
  const accentIndigo = "#b8237f";
  const accentGold = "#d97706";
  const textMuted = "#94a3b8";

  let subject = "";
  let headline = "";
  let messageHtml = "";
  let buttonText = "";
  let buttonUrl = data.actionUrl || "https://iec.ius.edu.ba/portal";

  switch (templateKey) {
    case "welcome":
      subject = "IUS Engineering Club'a Hoş Geldiniz! 🚀 Hesabınızı Doğrulayın";
      headline = "Mühendislik Ekosistemine Hoş Geldin!";
      messageHtml = `
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
          Sevgili <strong>${data.recipientName}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
          International University of Sarajevo (IUS) bünyesinde faaliyet gösteren <strong>IUS Engineering Club (IEC)</strong> ailesine katıldığınız için teşekkür ederiz.
        </p>
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
          Gömülü donanım projelerine katılmak, haftalık AI & coding atölyelerinde yer almak ve 24 saatlik uluslararası DevHack maratonunda yarışmak için hesabınızı aşağıdaki bağlantıdan doğrulayın:
        </p>
      `;
      buttonText = "Hesabımı Doğrula ve Portala Gir";
      buttonUrl = data.actionUrl || "https://iec.ius.edu.ba/portal/giris";
      break;

    case "application_approved":
      subject = "Tebrikler! IEC Kulüp Üyeliği Başvurunuz Kabul Edildi 🎉";
      headline = "Başvurunuz Onaylandı! Aramıza Hoş Geldin";
      messageHtml = `
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
          Tebrikler <strong>${data.recipientName}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
          FENS Yönetim Kurulu ve Kulüp Başkanlığı tarafından gerçekleştirilen değerlendirme neticesinde kulüp üyeliği başvurunuz resmi olarak <strong>onaylanmıştır</strong>.
        </p>
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
          Linear görev panosuna, GitHub organizasyon depolarımıza ve üye topluluk kanallarımıza erişmek için üye portalına giriş yapabilirsiniz:
        </p>
      `;
      buttonText = "Üye Portalına Giriş Yap";
      buttonUrl = data.actionUrl || "https://iec.ius.edu.ba/portal";
      break;

    case "event_reminder":
      subject = `Hatırlatma: Yarınki "${data.eventTitle || "Mühendislik Atölyesi"}" Başlıyor! ⏰`;
      headline = "Yarın Salonda Buluşuyoruz!";
      messageHtml = `
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
          Merhaba <strong>${data.recipientName}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
          Kayıt olduğunuz <strong>${data.eventTitle}</strong> etkinliği yarın başlıyor.
        </p>
        <div style="background-color: #1e293b; border-left: 4px solid #b8237f; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
          <div style="font-size: 12px; color: #94a3b8; font-family: monospace;">ETKİNLİK DETAYLARI:</div>
          <div style="font-size: 14px; font-weight: bold; color: #ffffff; margin-top: 4px;">Salon: ${data.eventVenue || "A-Block Lab 102"}</div>
          <div style="font-size: 13px; color: #ec6cc0; margin-top: 2px;">Tarih & Saat: ${data.eventDate || "Yarın 14:00"}</div>
        </div>
        <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 22px; color: #94a3b8;">
          💡 <em>Hatırlatma: Salondaki projeksiyonda 60 saniyede bir dönen dinamik QR kodu taratarak yoklama vermeyi ve resmi başarı sertifikanızı almayı unutmayın.</em>
        </p>
      `;
      buttonText = "Etkinlik Detaylarını İncele";
      buttonUrl = data.actionUrl || "https://iec.ius.edu.ba/portal/etkinlikler";
      break;

    case "certificate_issued":
      subject = `Tebrikler! Başarı Sertifikanız Hazırlandı 🏆 (${data.certificateCode || "IEC-2026"})`;
      headline = "Resmi Başarı Sertifikanız Üretildi!";
      messageHtml = `
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
          Tebrikler <strong>${data.recipientName}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
          <strong>"${data.eventTitle || "Mühendislik Atölyesi"}"</strong> etkinliğini başarıyla tamamladığınız için resmi katılım ve başarı sertifikanız üretildi.
        </p>
        <div style="background-color: #1e293b; border: 1px solid #d97706; padding: 16px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <div style="font-size: 11px; font-family: monospace; color: #f59e0b; letter-spacing: 1px;">RESMİ DOĞRULAMA KODU:</div>
          <div style="font-size: 20px; font-weight: bold; color: #ffffff; font-family: monospace; margin: 6px 0;">${data.certificateCode || "IEC-2026-E49A"}</div>
          <div style="font-size: 12px; color: #94a3b8;">Eğitim Süresi: ${data.trainingHours || 6} Saat • FENS & IEC Onaylı</div>
        </div>
        <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 22px; color: #94a3b8;">
          Sertifikanızı yüksek çözünürlüklü vektör PDF olarak indirebilir ve tek tıkla LinkedIn profilinize lisans olarak ekleyebilirsiniz.
        </p>
      `;
      buttonText = "Sertifikamı Görüntüle & PDF İndir";
      buttonUrl = data.actionUrl || "https://iec.ius.edu.ba/portal/sertifikalarim";
      break;
  }

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${primaryBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${primaryBg}; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: ${cardBg}; border: 1px solid #334155; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #1e293b;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: ${accentIndigo}; width: 36px; height: 36px; border-radius: 10px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: bold; font-size: 16px;">
                    IEC
                  </td>
                  <td style="padding-left: 12px; text-align: left;">
                    <div style="font-size: 16px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">IUS ENGINEERING CLUB</div>
                    <div style="font-size: 10px; color: ${textMuted}; font-family: monospace; letter-spacing: 0.5px;">FACULTY OF ENGINEERING & NATURAL SCIENCES</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Headline Banner -->
          <tr>
            <td style="padding: 28px 32px 8px 32px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                ${headline}
              </h2>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 16px 32px 28px 32px;">
              ${messageHtml}

              <!-- Primary CTA Button -->
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin: 28px auto 8px auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: ${accentIndigo};">
                    <a href="${buttonUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 13px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.2px;">
                      ${buttonText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0c0810; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: ${textMuted}; font-family: monospace;">
                International University of Sarajevo • Hrasnička cesta 15, Ilidža 71210 Sarajevo
              </p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                Bu e-posta IUS Engineering Club platformundaki üyeliğiniz dolayısıyla gönderilmiştir.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}
