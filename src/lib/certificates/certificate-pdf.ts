import { PDFDocument, rgb, StandardFonts, type PDFFont } from "pdf-lib";
import QRCode from "qrcode";
import type { CertificateItem } from "../events/event-types";
import { SITE_URL } from "@/lib/site-url";

/**
 * Official A4 landscape certificate with an embedded verification QR code.
 * The certificate is an English document regardless of the portal language.
 */

// Kept for existing imports; client components should import from "@/lib/certificates/linkedin".
export { generateLinkedInCertUrl } from "./linkedin";

export type CertificatePdfData = Pick<
  CertificateItem,
  "userName" | "eventTitle" | "trainingHours" | "issueDate" | "certificateCode" | "verifyUrl"
>;

const CHARACTER_MAP: Record<string, string> = {
  Ş: "S", ş: "s", İ: "I", ı: "i", Ğ: "G", ğ: "g", Ç: "C", ç: "c", Ö: "O", ö: "o", Ü: "U", ü: "u",
  Č: "C", č: "c", Ć: "C", ć: "c", Đ: "D", đ: "d", Š: "S", š: "s", Ž: "Z", ž: "z",
  "•": "-", "–": "-", "—": "-", "“": '"', "”": '"', "‘": "'", "’": "'",
};

/**
 * The standard PDF fonts only encode WinAnsi, so names such as "Đurić" would make pdf-lib throw.
 * Map known letters, strip remaining accents and drop anything outside printable ASCII.
 */
function toSafePdfText(value: string): string {
  if (!value) return "";
  return Array.from(value, (char) => CHARACTER_MAP[char] ?? char)
    .join("")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

/** Largest size (down to a minimum) at which the text fits the given width. */
function fitFontSize(font: PDFFont, text: string, maxWidth: number, preferred: number, minimum: number): number {
  let size = preferred;
  while (size > minimum && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.5;
  return size;
}

function formatIssueDate(issueDate: string): string {
  const date = new Date(`${issueDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return issueDate;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

export async function generateCertificatePdf(cert: CertificatePdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`IUS Engineering Club certificate ${cert.certificateCode}`);
  doc.setAuthor("IUS Engineering Club");

  // A4 landscape: 842 x 595 points
  const width = 842;
  const height = 595;
  const maxTextWidth = width - 140;
  const page = doc.addPage([width, height]);

  const fontHelvetica = await doc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontTimes = await doc.embedFont(StandardFonts.TimesRoman);
  const fontTimesBold = await doc.embedFont(StandardFonts.TimesRomanBold);

  const navy = rgb(15 / 255, 23 / 255, 42 / 255);
  const gold = rgb(180 / 255, 83 / 255, 9 / 255);
  const lightGold = rgb(245 / 255, 158 / 255, 11 / 255);
  const slateDark = rgb(51 / 255, 65 / 255, 85 / 255);
  const slateMuted = rgb(100 / 255, 116 / 255, 139 / 255);
  const bgOffWhite = rgb(254 / 255, 254 / 255, 255 / 255);

  const drawCentered = (text: string, y: number, size: number, font: PDFFont, color = navy) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
    return textWidth;
  };

  page.drawRectangle({ x: 0, y: 0, width, height, color: bgOffWhite });
  page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: navy, borderWidth: 3 });
  page.drawRectangle({ x: 28, y: 28, width: width - 56, height: height - 56, borderColor: gold, borderWidth: 1.5 });

  const cornerSize = 16;
  for (const corner of [
    { x: 32, y: height - 32 - cornerSize },
    { x: width - 32 - cornerSize, y: height - 32 - cornerSize },
    { x: 32, y: 32 },
    { x: width - 32 - cornerSize, y: 32 },
  ]) {
    page.drawRectangle({
      x: corner.x,
      y: corner.y,
      width: cornerSize,
      height: cornerSize,
      borderColor: gold,
      borderWidth: 1,
      color: rgb(254 / 255, 243 / 255, 199 / 255),
    });
  }

  drawCentered(
    "INTERNATIONAL UNIVERSITY OF SARAJEVO - FACULTY OF ENGINEERING AND NATURAL SCIENCES",
    530,
    8.5,
    fontHelveticaBold,
    slateMuted
  );
  drawCentered("IUS ENGINEERING CLUB", 502, 20, fontHelveticaBold, navy);
  drawCentered("CERTIFICATE OF ACHIEVEMENT", 445, 26, fontTimesBold, gold);
  page.drawLine({
    start: { x: width / 2 - 140, y: 432 },
    end: { x: width / 2 + 140, y: 432 },
    thickness: 1.5,
    color: lightGold,
  });

  drawCentered("This official credential is hereby conferred upon", 400, 12, fontTimes, slateDark);

  const recipientName = toSafePdfText(cert.userName.toUpperCase());
  const nameSize = fitFontSize(fontHelveticaBold, recipientName, maxTextWidth, 26, 14);
  const nameWidth = drawCentered(recipientName, 355, nameSize, fontHelveticaBold, navy);
  page.drawLine({
    start: { x: (width - nameWidth) / 2 - 20, y: 346 },
    end: { x: (width + nameWidth) / 2 + 20, y: 346 },
    thickness: 1,
    color: gold,
  });

  drawCentered(
    "for actively participating in and successfully fulfilling all technical requirements of the hands-on engineering event:",
    315,
    11,
    fontTimes,
    slateDark
  );

  const eventName = `"${toSafePdfText(cert.eventTitle)}"`;
  drawCentered(eventName, 288, fitFontSize(fontHelveticaBold, eventName, maxTextWidth, 15, 9), fontHelveticaBold, navy);

  const issuedText = `Issued on ${formatIssueDate(cert.issueDate)}`;
  const detailsLine =
    typeof cert.trainingHours === "number" && cert.trainingHours > 0
      ? `Total Practical Training: ${cert.trainingHours} Hours  |  ${issuedText}`
      : issuedText;
  drawCentered(detailsLine, 262, 10, fontHelvetica, slateMuted);

  // Signatures: faculty advisor (left) and club president (right)
  const sigY = 110;
  page.drawLine({ start: { x: 90, y: sigY + 28 }, end: { x: 270, y: sigY + 28 }, thickness: 1, color: slateDark });
  page.drawText("Prof. Dr. Leila Miller", { x: 100, y: sigY + 12, size: 11, font: fontHelveticaBold, color: navy });
  page.drawText("Faculty Academic Advisor, FENS", { x: 90, y: sigY - 2, size: 9, font: fontHelvetica, color: slateMuted });

  page.drawLine({ start: { x: 400, y: sigY + 28 }, end: { x: 580, y: sigY + 28 }, thickness: 1, color: slateDark });
  page.drawText(toSafePdfText("Kaan Mete Şenyıldız"), { x: 415, y: sigY + 12, size: 11, font: fontHelveticaBold, color: navy });
  page.drawText("Club President, IEC", { x: 405, y: sigY - 2, size: 9, font: fontHelvetica, color: slateMuted });

  const verifyUrl = cert.verifyUrl || `${SITE_URL}/dogrula?code=${encodeURIComponent(cert.certificateCode)}`;
  try {
    const qrPngBuffer = await QRCode.toBuffer(verifyUrl, {
      type: "png",
      width: 140,
      margin: 1,
      color: { dark: "#0f172aff", light: "#ffffffff" },
    });
    const qrImage = await doc.embedPng(qrPngBuffer);
    page.drawImage(qrImage, { x: width - 185, y: 65, width: 78, height: 78 });
    page.drawText("SCAN TO VERIFY", { x: width - 185, y: 150, size: 7.5, font: fontHelveticaBold, color: gold });
  } catch (error) {
    console.warn("[certificates] QR code render failed", error);
  }

  drawCentered(`OFFICIAL VERIFICATION CODE: ${cert.certificateCode}`, 45, 9, fontHelveticaBold, gold);
  const footerNotice = toSafePdfText(
    `Registered with the IUS Engineering Club. Verify this certificate at ${SITE_URL}/dogrula with the code above.`
  );
  drawCentered(footerNotice, 32, fitFontSize(fontHelvetica, footerNotice, maxTextWidth, 7.5, 6), fontHelvetica, slateMuted);

  return await doc.save();
}
