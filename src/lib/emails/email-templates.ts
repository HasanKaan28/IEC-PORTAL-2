/**
 * HTML email templates (Supabase Auth, Resend, SendGrid or Nodemailer compatible).
 *
 * Every caller-supplied value is HTML-escaped before it is placed in the markup, and link targets
 * are limited to http(s) URLs, so a name or event title cannot inject markup into an email.
 *
 * Language: the bodies are Turkish only for now. renderEmailTemplate does not take a locale yet;
 * adding English means adding a `locale` parameter and an English copy of each case below.
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

const SITE_URL = "https://iec.ius.edu.ba";

/** Escapes text for use in HTML element content and quoted attribute values. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Returns the URL when it is an absolute http(s) URL, otherwise the fallback. */
function safeUrl(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function renderEmailTemplate(
  templateKey: EmailTemplateKey,
  data: EmailTemplateData
): { subject: string; html: string } {
  const primaryBg = "#f2f5fa";
  const cardBg = "#ffffff";
  const accentBrand = "#1f5a94";
  const textMuted = "#64748b";

  const name = escapeHtml(data.recipientName);
  const eventTitleText = data.eventTitle || "Mühendislik Atölyesi";
  const eventTitle = escapeHtml(eventTitleText);
  const eventVenue = escapeHtml(data.eventVenue || "A-Block Lab 102");
  const eventDate = escapeHtml(data.eventDate || "Yarın 14:00");
  const certificateCodeText = data.certificateCode || "IEC-2026";
  const certificateCode = escapeHtml(certificateCodeText);
  const trainingHours = escapeHtml(
    typeof data.trainingHours === "number" && Number.isFinite(data.trainingHours) && data.trainingHours > 0
      ? data.trainingHours
      : 6
  );

  let subject = "";
  let headline = "";
  let messageHtml = "";
  let buttonText = "";
  let buttonUrl = safeUrl(data.actionUrl, `${SITE_URL}/portal`);

  switch (templateKey) {
    case "welcome":
      subject = "IUS Engineering Club'a hoş geldiniz: hesabınızı doğrulayın";
      headline = "Mühendislik ekosistemine hoş geldin!";
      messageHtml = `
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #334155;">
          Sevgili <strong>${name}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #334155;">
          International University of Sarajevo (IUS) bünyesinde faaliyet gösteren <strong>IUS Engineering Club (IEC)</strong> ailesine katıldığınız için teşekkür ederiz.
        </p>
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 24px; color: #334155;">
          Donanım projelerine katılmak, atölyelerde yer almak ve DevHack maratonunda yarışmak için hesabınızı aşağıdaki bağlantıdan doğrulayın:
        </p>
      `;
      buttonText = "Hesabımı doğrula";
      buttonUrl = safeUrl(data.actionUrl, `${SITE_URL}/portal/giris`);
      break;

    case "application_approved":
      subject = "Tebrikler! IEC üyelik başvurunuz kabul edildi";
      headline = "Başvurunuz onaylandı, aramıza hoş geldin!";
      messageHtml = `
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #334155;">
          Tebrikler <strong>${name}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #334155;">
          Kulüp yönetimi tarafından yapılan değerlendirme sonucunda üyelik başvurunuz <strong>onaylanmıştır</strong>.
        </p>
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 24px; color: #334155;">
          Görevlere, projelere ve üye kanallarına erişmek için @student.ius.edu.ba adresinizle üye portalına giriş yapabilirsiniz:
        </p>
      `;
      buttonText = "Üye portalına giriş yap";
      buttonUrl = safeUrl(data.actionUrl, `${SITE_URL}/portal`);
      break;

    case "event_reminder":
      subject = `Hatırlatma: "${eventTitleText}" yarın başlıyor`;
      headline = "Yarın salonda buluşuyoruz!";
      messageHtml = `
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #334155;">
          Merhaba <strong>${name}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #334155;">
          Kayıt olduğunuz <strong>${eventTitle}</strong> etkinliği yarın başlıyor.
        </p>
        <div style="background-color: #f0f6fc; border-left: 4px solid ${accentBrand}; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
          <div style="font-size: 12px; color: #64748b; font-family: monospace;">ETKİNLİK DETAYLARI</div>
          <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 4px;">Salon: ${eventVenue}</div>
          <div style="font-size: 13px; color: #154a7f; margin-top: 2px;">Tarih ve saat: ${eventDate}</div>
        </div>
        <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 22px; color: #64748b;">
          <em>Hatırlatma: Salondaki ekranda gösterilen QR kodu okutarak yoklama vermeyi unutmayın. Sertifikanız yoklamaya göre hazırlanır.</em>
        </p>
      `;
      buttonText = "Etkinlik detaylarını incele";
      buttonUrl = safeUrl(data.actionUrl, `${SITE_URL}/portal/etkinlikler`);
      break;

    case "certificate_issued":
      subject = `Tebrikler! Katılım sertifikanız hazır (${certificateCodeText})`;
      headline = "Katılım sertifikanız hazırlandı!";
      messageHtml = `
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #334155;">
          Tebrikler <strong>${name}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #334155;">
          <strong>"${eventTitle}"</strong> etkinliğini tamamladığınız için katılım sertifikanız hazırlandı.
        </p>
        <div style="background-color: #f0f6fc; border: 1px solid #ecc246; padding: 16px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <div style="font-size: 12px; font-family: monospace; color: #8c651a; letter-spacing: 1px;">DOĞRULAMA KODU</div>
          <div style="font-size: 20px; font-weight: bold; color: #0f172a; font-family: monospace; margin: 6px 0;">${certificateCode}</div>
          <div style="font-size: 12px; color: #64748b;">Eğitim süresi: ${trainingHours} saat</div>
        </div>
        <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 22px; color: #64748b;">
          Sertifikanızı PDF olarak indirebilir ve doğrulama koduyla LinkedIn profilinize ekleyebilirsiniz.
        </p>
      `;
      buttonText = "Sertifikamı görüntüle";
      buttonUrl = safeUrl(data.actionUrl, `${SITE_URL}/portal/sertifikalarim`);
      break;
  }

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${primaryBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${primaryBg}; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: ${cardBg}; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: ${accentBrand}; width: 36px; height: 36px; border-radius: 10px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: bold; font-size: 14px;">
                    IEC
                  </td>
                  <td style="padding-left: 12px; text-align: left;">
                    <div style="font-size: 16px; font-weight: bold; color: #0f172a; letter-spacing: -0.5px;">IUS ENGINEERING CLUB</div>
                    <div style="font-size: 12px; color: ${textMuted}; font-family: monospace;">Faculty of Engineering and Natural Sciences</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 32px 8px 32px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                ${escapeHtml(headline)}
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 28px 32px;">
              ${messageHtml}
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin: 28px auto 8px auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: ${accentBrand};">
                    <a href="${escapeHtml(buttonUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      ${escapeHtml(buttonText)} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background-color: ${primaryBg}; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: ${textMuted}; font-family: monospace;">
                International University of Sarajevo, Hrasnička cesta 15, Ilidža 71210 Sarajevo
              </p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Bu e-posta IUS Engineering Club platformundaki üyeliğiniz nedeniyle gönderilmiştir.
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
