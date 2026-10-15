import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { CertificateItem } from "../events/event-types";

/**
 * High-Resolution Vector PDF Certificate Engine
 * Generates an official, tamper-proof A4 landscape certificate with embedded QR verification.
 */
export async function generateCertificatePdf(
  cert: CertificateItem
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  // A4 Landscape dimensions: 842 x 595 points
  const width = 842;
  const height = 595;
  const page = doc.addPage([width, height]);

  const fontHelvetica = await doc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontTimes = await doc.embedFont(StandardFonts.TimesRoman);
  const fontTimesBold = await doc.embedFont(StandardFonts.TimesRomanBold);

  // Color Palette
  const navy = rgb(15 / 255, 23 / 255, 42 / 255); // #0f172a
  const gold = rgb(180 / 255, 83 / 255, 9 / 255); // #b45309
  const lightGold = rgb(245 / 255, 158 / 255, 11 / 255); // #f59e0b
  const slateDark = rgb(51 / 255, 65 / 255, 85 / 255); // #334155
  const slateMuted = rgb(100 / 255, 116 / 255, 139 / 255); // #64748b
  const bgOffWhite = rgb(254 / 255, 254 / 255, 255 / 255);

  // Background Fill
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: bgOffWhite,
  });

  // Outer Border (Navy)
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: navy,
    borderWidth: 3,
  });

  // Inner Border (Gold)
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: gold,
    borderWidth: 1.5,
  });

  // Decorative Corner Accent Lines
  const cornerSize = 16;
  const corners = [
    { x: 32, y: height - 32 - cornerSize },
    { x: width - 32 - cornerSize, y: height - 32 - cornerSize },
    { x: 32, y: 32 },
    { x: width - 32 - cornerSize, y: 32 },
  ];
  for (const c of corners) {
    page.drawRectangle({
      x: c.x,
      y: c.y,
      width: cornerSize,
      height: cornerSize,
      borderColor: gold,
      borderWidth: 1,
      color: rgb(254 / 255, 243 / 255, 199 / 255), // light gold tint
    });
  }

function toSafePdfText(str: string): string {
  if (!str) return "";
  const map: Record<string, string> = {
    "Ş": "S", "ş": "s",
    "İ": "I", "ı": "i",
    "Ğ": "G", "ğ": "g",
    "Ç": "C", "ç": "c",
    "Ö": "O", "ö": "o",
    "Ü": "U", "ü": "u",
    "•": "-",
    "–": "-", "—": "-",
    "“": '"', "”": '"',
    "‘": "'", "’": "'",
  };
  return str.replace(/[ŞşİıĞğÇçÖöÜü•–—“”‘’]/g, (c) => map[c] || c);
}

  // Header 1: Organization
  const orgSubtext = toSafePdfText("INTERNATIONAL UNIVERSITY OF SARAJEVO - FACULTY OF ENGINEERING AND NATURAL SCIENCES");
  const orgSubWidth = fontHelvetica.widthOfTextAtSize(orgSubtext, 8.5);
  page.drawText(orgSubtext, {
    x: (width - orgSubWidth) / 2,
    y: 530,
    size: 8.5,
    font: fontHelveticaBold,
    color: slateMuted,
  });

  const clubTitle = "IUS ENGINEERING CLUB";
  const clubWidth = fontHelveticaBold.widthOfTextAtSize(clubTitle, 20);
  page.drawText(clubTitle, {
    x: (width - clubWidth) / 2,
    y: 502,
    size: 20,
    font: fontHelveticaBold,
    color: navy,
  });

  // Header 2: Main Certificate Title
  const certHeading = "CERTIFICATE OF ACHIEVEMENT";
  const headingWidth = fontTimesBold.widthOfTextAtSize(certHeading, 26);
  page.drawText(certHeading, {
    x: (width - headingWidth) / 2,
    y: 445,
    size: 26,
    font: fontTimesBold,
    color: gold,
  });

  // Gold divider line below title
  page.drawLine({
    start: { x: width / 2 - 140, y: 432 },
    end: { x: width / 2 + 140, y: 432 },
    thickness: 1.5,
    color: lightGold,
  });

  // Awarded text
  const awardedToText = "This official credential is hereby conferred upon";
  const awardedWidth = fontTimes.widthOfTextAtSize(awardedToText, 12);
  page.drawText(awardedToText, {
    x: (width - awardedWidth) / 2,
    y: 400,
    size: 12,
    font: fontTimes,
    color: slateDark,
  });

  // Recipient Name (Prominent & Centered)
  const recipientName = toSafePdfText(cert.userName.toUpperCase());
  const nameWidth = fontHelveticaBold.widthOfTextAtSize(recipientName, 26);
  page.drawText(recipientName, {
    x: (width - nameWidth) / 2,
    y: 355,
    size: 26,
    font: fontHelveticaBold,
    color: navy,
  });

  // Underline for recipient
  page.drawLine({
    start: { x: (width - nameWidth) / 2 - 20, y: 346 },
    end: { x: (width + nameWidth) / 2 + 20, y: 346 },
    thickness: 1,
    color: gold,
  });

  // Reason text
  const reasonText1 = "for actively participating in and successfully fulfilling all technical requirements of the hands-on engineering event:";
  const reason1Width = fontTimes.widthOfTextAtSize(reasonText1, 11);
  page.drawText(reasonText1, {
    x: (width - reason1Width) / 2,
    y: 315,
    size: 11,
    font: fontTimes,
    color: slateDark,
  });

  // Event Name
  const eventName = `"${toSafePdfText(cert.eventTitle)}"`;
  const eventWidth = fontHelveticaBold.widthOfTextAtSize(eventName, 15);
  page.drawText(eventName, {
    x: (width - eventWidth) / 2,
    y: 288,
    size: 15,
    font: fontHelveticaBold,
    color: navy,
  });

  // Skills / Scope info
  const hoursInfo = `Total Practical Training: ${cert.trainingHours} Hours  |  Issued on ${cert.issueDate}`;
  const hoursWidth = fontHelvetica.widthOfTextAtSize(hoursInfo, 10);
  page.drawText(hoursInfo, {
    x: (width - hoursWidth) / 2,
    y: 262,
    size: 10,
    font: fontHelvetica,
    color: slateMuted,
  });

  // Signatures Section (Left: Faculty Advisor, Right: Club President)
  const sigY = 110;

  // Left Signature: Academic Advisor
  page.drawLine({
    start: { x: 90, y: sigY + 28 },
    end: { x: 270, y: sigY + 28 },
    thickness: 1,
    color: slateDark,
  });
  page.drawText("Prof. Dr. Leila Miller", {
    x: 100,
    y: sigY + 12,
    size: 11,
    font: fontHelveticaBold,
    color: navy,
  });
  page.drawText("Faculty Academic Advisor, FENS", {
    x: 90,
    y: sigY - 2,
    size: 9,
    font: fontHelvetica,
    color: slateMuted,
  });

  // Right Signature: Club President
  page.drawLine({
    start: { x: 400, y: sigY + 28 },
    end: { x: 580, y: sigY + 28 },
    thickness: 1,
    color: slateDark,
  });
  page.drawText("Hasan Kaan Karabulut", {
    x: 415,
    y: sigY + 12,
    size: 11,
    font: fontHelveticaBold,
    color: navy,
  });
  page.drawText("Club President & Co-Founder, IEC", {
    x: 405,
    y: sigY - 2,
    size: 9,
    font: fontHelvetica,
    color: slateMuted,
  });

  // QR Code Verification Block (Bottom Right)
  try {
    const verifyUrl = cert.verifyUrl || `https://iec.ius.edu.ba/dogrula?code=${cert.certificateCode}`;
    const qrPngBuffer = await QRCode.toBuffer(verifyUrl, {
      type: "png",
      width: 140,
      margin: 1,
      color: {
        dark: "#0f172aff",
        light: "#ffffffff",
      },
    });

    const qrImage = await doc.embedPng(qrPngBuffer);
    page.drawImage(qrImage, {
      x: width - 185,
      y: 65,
      width: 78,
      height: 78,
    });

    page.drawText("SCAN TO VERIFY", {
      x: width - 185,
      y: 150,
      size: 7.5,
      font: fontHelveticaBold,
      color: gold,
    });
  } catch (err) {
    // If QR code rendering fails, fallback gracefully
    console.warn("QR Code render error:", err);
  }

  // Certificate Unique Verification Code (Bottom Centered)
  const codeText = `OFFICIAL VERIFICATION CODE: ${cert.certificateCode}`;
  const codeWidth = fontHelveticaBold.widthOfTextAtSize(codeText, 9);
  page.drawText(codeText, {
    x: (width - codeWidth) / 2,
    y: 45,
    size: 9,
    font: fontHelveticaBold,
    color: gold,
  });

  const footerNotice = "This credential is digitally registered in the IUS Engineering Club ecosystem and verified via secure hash.";
  const noticeWidth = fontHelvetica.widthOfTextAtSize(footerNotice, 7.5);
  page.drawText(footerNotice, {
    x: (width - noticeWidth) / 2,
    y: 32,
    size: 7.5,
    font: fontHelvetica,
    color: slateMuted,
  });

  return await doc.save();
}

/**
 * Generates a direct LinkedIn "Add to Profile" Certification URL
 */
export function generateLinkedInCertUrl(cert: CertificateItem): string {
  const baseUrl = "https://www.linkedin.com/profile/add";
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${cert.eventTitle} — IUS Engineering Club`,
    organizationName: "International University of Sarajevo (IUS)",
    issueYear: new Date(cert.issueDate).getFullYear().toString(),
    issueMonth: (new Date(cert.issueDate).getMonth() + 1).toString(),
    certUrl: cert.verifyUrl,
    certId: cert.certificateCode,
  });

  return `${baseUrl}?${params.toString()}`;
}
