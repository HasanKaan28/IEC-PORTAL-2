#!/usr/bin/env python3
"""
=============================================================================
IUS ENGINEERING CLUB — CERTIFICATE GENERATION & DISPATCH ENGINE
=============================================================================
Generates ultra-high resolution vector PDF certificates for IUS Engineering Club
events, workshops, hackathons, and symposiums.

Outputs to:
  1. Desktop Hub: C:\\Users\\Kaan\\Desktop\\IEC\\06_Etkinlikler_ve_Workshoplar\\Sertifikalar
  2. Local Workspace: export_documents/certificates/

Usage:
  python scripts/generate_certificates.py --sample
  python scripts/generate_certificates.py --name "Ahmed Hadzimurati" --event "Modern AI & Prompt Engineering Masterclass" --email "ahmed@example.com"
  python scripts/generate_certificates.py --csv attendees.csv
=============================================================================
"""

import argparse
import csv
import os
import sys
from pathlib import Path
from typing import Optional, Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF

# Workspace paths
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = WORKSPACE_ROOT / "assets"
EXPORT_DIR = WORKSPACE_ROOT / "export_documents" / "certificates"

# Desktop Hub path
DESKTOP_DIR = Path(os.environ.get("USERPROFILE", r"C:\Users\Kaan")) / "Desktop"
DESKTOP_IEC_CERTS = DESKTOP_DIR / "IEC" / "06_Etkinlikler_ve_Workshoplar" / "Sertifikalar"

# Official Club Configuration
CLUB_CONFIG = {
    "UNIVERSITY": "INTERNATIONAL UNIVERSITY OF SARAJEVO",
    "FACULTY": "FACULTY OF ENGINEERING AND NATURAL SCIENCES (FENS)",
    "CLUB_NAME": "IUS ENGINEERING CLUB",
    "MOTTO": "Empowering Student Engineering Excellence & Innovation",
    "ADVISOR_NAME": "Prof. Dr. Leila Miller",
    "ADVISOR_TITLE": "Faculty Academic Advisor, FENS\nInternational University of Sarajevo",
    "PRESIDENT_NAME": "Hasan Kaan",
    "PRESIDENT_TITLE": "Club President & Co-Founder\nIUS Engineering Club",
    "VERIFY_BASE_URL": "https://hasankaan28.github.io/ius-engineering-events-site/verify/",
}

# Color Palette (Hex to ReportLab Color)
COLOR_NAVY_DARK = colors.HexColor("#0A1128")
COLOR_NAVY_DEEP = colors.HexColor("#050814")
COLOR_GOLD = colors.HexColor("#D4AF37")
COLOR_GOLD_LIGHT = colors.HexColor("#F5D77F")
COLOR_TEXT_MAIN = colors.HexColor("#0F172A")
COLOR_TEXT_MUTED = colors.HexColor("#64748B")
COLOR_BG_IVORY = colors.HexColor("#FCFBF9")


def ensure_directories():
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    try:
        DESKTOP_IEC_CERTS.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        print(f"[Warning] Could not create Desktop directory: {e}")


def draw_certificate(
    c: canvas.Canvas,
    name: str,
    event_title: str,
    event_date: str,
    cert_id: str,
    output_filename: str
):
    width, height = landscape(A4) # 841.89 x 595.27 points

    # 1. Background Fill (Subtle Ivory Luxury Tint)
    c.setFillColor(COLOR_BG_IVORY)
    c.rect(0, 0, width, height, fill=True, stroke=False)

    # 2. Outer Deep Navy Border
    margin_outer = 18
    c.setStrokeColor(COLOR_NAVY_DARK)
    c.setLineWidth(7)
    c.rect(margin_outer, margin_outer, width - 2 * margin_outer, height - 2 * margin_outer, fill=False, stroke=True)

    # 3. Inner Gold Border
    margin_inner = 25
    c.setStrokeColor(COLOR_GOLD)
    c.setLineWidth(1.8)
    c.rect(margin_inner, margin_inner, width - 2 * margin_inner, height - 2 * margin_inner, fill=False, stroke=True)

    # 4. Corner Geometric Flourishes
    flourish_size = 28
    corners = [
        (margin_inner, height - margin_inner), # Top-Left
        (width - margin_inner, height - margin_inner), # Top-Right
        (width - margin_inner, margin_inner), # Bottom-Right
        (margin_inner, margin_inner), # Bottom-Left
    ]
    c.setStrokeColor(COLOR_GOLD)
    c.setLineWidth(1.2)
    for cx, cy in corners:
        c.circle(cx, cy, 6, fill=False, stroke=True)
        c.circle(cx, cy, 14, fill=False, stroke=True)

    # 5. Header Section (Logos & Institution Text)
    # Top Left Logo: IUS Logo
    ius_logo_path = ASSETS_DIR / "ius_logo.png"
    if ius_logo_path.exists():
        c.drawImage(str(ius_logo_path), margin_inner + 20, height - margin_inner - 62, width=110, height=48, preserveAspectRatio=True, mask='auto')

    # Top Right Logo: Official Club Seal
    seal_logo_path = ASSETS_DIR / "club_seal_perfect.png"
    if seal_logo_path.exists():
        c.drawImage(str(seal_logo_path), width - margin_inner - 75, height - margin_inner - 66, width=54, height=54, preserveAspectRatio=True, mask='auto')

    # Institution Center Text
    c.setFillColor(COLOR_TEXT_MUTED)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawCentredString(width / 2, height - margin_inner - 26, f"{CLUB_CONFIG['UNIVERSITY']} • {CLUB_CONFIG['FACULTY']}")

    c.setFillColor(COLOR_NAVY_DARK)
    c.setFont("Helvetica-Bold", 17)
    c.drawCentredString(width / 2, height - margin_inner - 46, CLUB_CONFIG["CLUB_NAME"])

    c.setStrokeColor(COLOR_GOLD)
    c.setLineWidth(1)
    c.line(width / 2 - 90, height - margin_inner - 54, width / 2 + 90, height - margin_inner - 54)

    # 6. Certificate Main Title
    c.setFillColor(COLOR_NAVY_DARK)
    c.setFont("Times-Bold", 26)
    c.drawCentredString(width / 2, height - 170, "CERTIFICATE OF PARTICIPATION")

    c.setFillColor(COLOR_GOLD)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(width / 2, height - 188, "THIS OFFICIAL CREDENTIAL IS PROUDLY AWARDED TO")

    # 7. Recipient Name
    c.setFillColor(COLOR_NAVY_DARK)
    c.setFont("Times-BoldItalic", 32)
    c.drawCentredString(width / 2, height - 240, name)

    # Name underline
    c.setStrokeColor(COLOR_GOLD)
    c.setLineWidth(1.5)
    name_width = c.stringWidth(name, "Times-BoldItalic", 32)
    underline_w = max(name_width + 40, 240)
    c.line(width / 2 - underline_w / 2, height - 248, width / 2 + underline_w / 2, height - 248)

    # 8. Citation Statement
    c.setFillColor(COLOR_TEXT_MAIN)
    c.setFont("Helvetica", 11)
    line1 = "in recognition of active participation and successful completion of the university engineering workshop titled:"
    c.drawCentredString(width / 2, height - 280, line1)

    c.setFillColor(COLOR_NAVY_DARK)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width / 2, height - 304, f'"{event_title}"')

    c.setFillColor(COLOR_TEXT_MAIN)
    c.setFont("Helvetica", 10.5)
    line3 = f"held at the International University of Sarajevo campus in {event_date}, demonstrating commendable technical proficiency,"
    line4 = "practical engineering problem-solving, and dedication to multidisciplinary technological advancement."
    c.drawCentredString(width / 2, height - 326, line3)
    c.drawCentredString(width / 2, height - 342, line4)

    # 9. Signatures & Verification Block
    sig_y = margin_inner + 45
    line_w = 170

    # --- Left: Faculty Academic Advisor ---
    left_x = margin_inner + 60
    # Handwritten style representation
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.setFont("Times-Italic", 18)
    c.drawCentredString(left_x + line_w / 2, sig_y + 28, "Leila Miller")

    c.setStrokeColor(COLOR_NAVY_DARK)
    c.setLineWidth(1.2)
    c.line(left_x, sig_y + 20, left_x + line_w, sig_y + 20)

    c.setFillColor(COLOR_NAVY_DARK)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawCentredString(left_x + line_w / 2, sig_y + 7, CLUB_CONFIG["ADVISOR_NAME"])

    c.setFillColor(COLOR_TEXT_MUTED)
    c.setFont("Helvetica", 8)
    c.drawCentredString(left_x + line_w / 2, sig_y - 5, "Faculty Academic Advisor, FENS")
    c.drawCentredString(left_x + line_w / 2, sig_y - 15, "International University of Sarajevo")

    # --- Right: Club President ---
    right_x = width - margin_inner - 60 - line_w
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.setFont("Times-Italic", 18)
    c.drawCentredString(right_x + line_w / 2, sig_y + 28, "Hasan Kaan")

    c.setStrokeColor(COLOR_NAVY_DARK)
    c.setLineWidth(1.2)
    c.line(right_x, sig_y + 20, right_x + line_w, sig_y + 20)

    c.setFillColor(COLOR_NAVY_DARK)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawCentredString(right_x + line_w / 2, sig_y + 7, CLUB_CONFIG["PRESIDENT_NAME"])

    c.setFillColor(COLOR_TEXT_MUTED)
    c.setFont("Helvetica", 8)
    c.drawCentredString(right_x + line_w / 2, sig_y - 5, "Club President & Co-Founder")
    c.drawCentredString(right_x + line_w / 2, sig_y - 15, "IUS Engineering Club")

    # --- Center: Verification QR Code & ID ---
    center_x = width / 2
    verify_url = f"{CLUB_CONFIG['VERIFY_BASE_URL']}?id={cert_id}"

    qr_size = 52
    qr_widget = qr.QrCodeWidget(verify_url)
    b = qr_widget.getBounds()
    qw, qh = b[2] - b[0], b[3] - b[1]
    d = Drawing(qr_size, qr_size, transform=[qr_size / qw, 0, 0, qr_size / qh, 0, 0])
    d.add(qr_widget)
    renderPDF.draw(d, c, center_x - qr_size / 2, sig_y + 5)

    # Box around QR
    c.setStrokeColor(COLOR_GOLD)
    c.setLineWidth(0.8)
    c.rect(center_x - qr_size / 2 - 2, sig_y + 3, qr_size + 4, qr_size + 4, fill=False, stroke=True)

    c.setFillColor(COLOR_TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawCentredString(center_x, sig_y - 6, "OFFICIAL CREDENTIAL ID")

    c.setFillColor(COLOR_NAVY_DARK)
    c.setFont("Courier-Bold", 8.5)
    c.drawCentredString(center_x, sig_y - 16, cert_id)


def generate_single_certificate(
    name: str,
    event_title: str = "Modern AI & Prompt Engineering Masterclass",
    event_date: str = "October 2026",
    cert_id: str = "IEC-2026-AI01-0042",
    output_filename: Optional[str] = None
) -> Dict[str, Path]:
    ensure_directories()

    if not output_filename:
        sanitized_name = name.replace(" ", "_")
        output_filename = f"Certificate_{sanitized_name}_{cert_id}.pdf"

    local_path = EXPORT_DIR / output_filename
    desktop_path = DESKTOP_IEC_CERTS / output_filename

    # Render PDF
    c = canvas.Canvas(str(local_path), pagesize=landscape(A4))
    draw_certificate(c, name, event_title, event_date, cert_id, output_filename)
    c.save()

    # Copy to Desktop Hub if available
    try:
        if DESKTOP_IEC_CERTS.exists():
            import shutil
            shutil.copy2(local_path, desktop_path)
    except Exception as e:
        print(f"[Warning] Could not copy to desktop: {e}")

    return {
        "local": local_path,
        "desktop": desktop_path
    }


def main():
    parser = argparse.ArgumentParser(description="IUS Engineering Club Certificate Engine")
    parser.add_argument("--sample", action="store_true", help="Generate a sample certificate for verification")
    parser.add_argument("--name", type=str, default="Ahmed Hadzimurati", help="Recipient full name")
    parser.add_argument("--event", type=str, default="Modern AI & Prompt Engineering Masterclass", help="Event title")
    parser.add_argument("--date", type=str, default="October 2026", help="Event date")
    parser.add_argument("--cert-id", type=str, default="IEC-2026-AI01-0042", help="Unique Certificate ID")
    parser.add_argument("--csv", type=str, help="Path to CSV file with columns: Name, Event, Date, ID")

    args = parser.parse_args()

    ensure_directories()

    if args.sample or not args.csv:
        print("Generating certificate...")
        paths = generate_single_certificate(
            name=args.name,
            event_title=args.event,
            event_date=args.date,
            cert_id=args.cert_id
        )
        print(f"[Success] Certificate generated successfully!")
        print(f"Local:   {paths['local']}")
        print(f"Desktop: {paths['desktop']}")
    else:
        csv_path = Path(args.csv)
        if not csv_path.exists():
            print(f"[Error] CSV file not found: {csv_path}")
            sys.exit(1)

        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                name = row.get("Name") or row.get("Full Name")
                event = row.get("Event") or args.event
                date = row.get("Date") or args.date
                cid = row.get("ID") or f"IEC-2026-GEN-{count+1:04d}"
                if name:
                    generate_single_certificate(name, event, date, cid)
                    count += 1
            print(f"[Success] Batch generated {count} certificates from CSV.")


if __name__ == "__main__":
    main()
