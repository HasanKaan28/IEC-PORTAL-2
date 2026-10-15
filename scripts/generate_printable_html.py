#!/usr/bin/env python3
"""
Convert markdown templates into printable, beautifully formatted HTML files
with formal IUS letterhead and clean print stylesheets.
"""

import os
import sys
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

workspace_root = Path(__file__).resolve().parent.parent
export_dir = workspace_root / "export_documents"
export_dir.mkdir(parents=True, exist_ok=True)

def wrap_html(title, body_content):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <style>
    @page {{ size: A4; margin: 20mm; }}
    body {{
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 800px;
      margin: 40px auto;
      padding: 30px;
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-radius: 8px;
    }}
    .header-logo {{
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }}
    h1 {{ color: #0f172a; font-size: 1.6rem; margin-top: 0; }}
    h2 {{ color: #0284c7; font-size: 1.25rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; }}
    h3 {{ color: #334155; font-size: 1.05rem; }}
    table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9rem; }}
    th, td {{ border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }}
    th {{ background-color: #f1f5f9; color: #0f172a; font-weight: 600; }}
    tr:nth-child(even) {{ background-color: #f8fafc; }}
    blockquote {{ border-left: 4px solid #0284c7; margin: 16px 0; padding: 10px 18px; background: #f0f9ff; color: #0369a1; }}
    .footer-note {{ margin-top: 40px; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }}
    @media print {{
      body {{ box-shadow: none; margin: 0; padding: 0; }}
    }}
  </style>
</head>
<body>
  <div class="header-logo">
    <strong>INTERNATIONAL UNIVERSITY OF SARAJEVO (IUS)</strong><br>
    <small>Faculty of Engineering and Natural Sciences (FENS) • Student Career Center (SCC)</small>
  </div>
  {body_content}
  <div class="footer-note">
    Official Document • IUS Engineering Club (IEC) • Academic Year 2026/2027
  </div>
</body>
</html>
"""

# Let's read markdown files and convert basic elements
def md_to_html(md_text):
    import html
    import re
    lines = md_text.split("\n")
    out = []
    in_table = False
    table_rows = []

    def format_inline(text):
        # Escape HTML first
        t = html.escape(text)
        # Allow line breaks
        t = t.replace("&lt;br&gt;", "<br>")
        t = t.replace("&lt;br/&gt;", "<br>")
        # Bold: **text**
        t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
        # Italic: *text*
        t = re.sub(r'\*(.+?)\*', r'<em>\1</em>', t)
        return t

    for line in lines:
        s = line.strip()
        if s.startswith("|") and s.endswith("|"):
            if not in_table:
                in_table = True
                table_rows = []
            table_rows.append(s)
            continue
        else:
            if in_table:
                in_table = False
                out.append("<table>")
                header_done = False
                for r in table_rows:
                    if ":---" in r or "---" in r:
                        continue
                    cols = [c.strip() for c in r.split("|")[1:-1]]
                    if not header_done:
                        out.append("<tr>" + "".join(f"<th>{format_inline(c)}</th>" for c in cols) + "</tr>")
                        header_done = True
                    else:
                        out.append("<tr>" + "".join(f"<td>{format_inline(c)}</td>" for c in cols) + "</tr>")
                out.append("</table>")

        if s.startswith("# "):
            out.append(f"<h1>{format_inline(s[2:])}</h1>")
        elif s.startswith("## "):
            out.append(f"<h2>{format_inline(s[3:])}</h2>")
        elif s.startswith("### "):
            out.append(f"<h3>{format_inline(s[4:])}</h3>")
        elif s.startswith("#### "):
            out.append(f"<h4 style='color: #0369a1; margin-top: 18px; margin-bottom: 6px;'>{format_inline(s[5:])}</h4>")
        elif s.startswith("> "):
            out.append(f"<blockquote>{format_inline(s[2:])}</blockquote>")
        elif s.startswith("* ") or s.startswith("- "):
            out.append(f"<li>{format_inline(s[2:])}</li>")
        elif s == "---":
            out.append("<hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;'>")
        elif s:
            out.append(f"<p>{format_inline(s)}</p>")

    if in_table:
        out.append("<table>")
        for r in table_rows:
            if ":---" in r: continue
            cols = [c.strip() for c in r.split("|")[1:-1]]
            out.append("<tr>" + "".join(f"<td>{format_inline(c)}</td>" for c in cols) + "</tr>")
        out.append("</table>")

    return "\n".join(out)

files_to_export = [
    ("templates/IUS_SKS_APPLICATION_PETITION.md", ["IUS_SCC_Official_Registration_Petition.html", "IUS_SCC_Resmi_Basvuru_Dilekcesi.html"], "IUS SCC Official Club Application Petition"),
    ("templates/ACADEMIC_ADVISOR_INVITATION.md", ["FENS_Academic_Advisor_Invitation_Letter.html", "FENS_Akademik_Danisman_Davet_Mektubu.html"], "Academic Advisor Invitation Letter"),
    ("templates/SCC_ANNUAL_ACTIVITY_PLAN.md", ["SCC_Proposed_Annual_Activity_Plan.html", "SCC_Yillik_Faaliyet_Plani.html"], "SCC Proposed Annual Activity Plan (2026/2027)"),
    ("templates/SCC_DRAFT_BUDGET.md", ["SCC_Proposed_Annual_Budget.html", "SCC_Taslak_Yillik_Butce.html"], "SCC Proposed Annual Budget Estimate (2026/2027)"),
    ("templates/SCC_FOUNDING_10_MEMBERS.md", ["SCC_Founding_Members_Roster.html", "SCC_10_Kurucu_Uye_Listesi.html"], "SCC Founding Members & Executive Roster"),
    ("constitution/CONSTITUTION.md", ["IEC_Official_Club_Constitution.html", "IEC_Resmi_Kulup_Tuzugu.html", "IEEC_Official_Club_Constitution.html", "IEEC_Resmi_Kulup_Tuzugu.html"], "IEC Official Club Constitution")
]

for src, dests, title in files_to_export:
    p = workspace_root / src
    if p.exists():
        with open(p, "r", encoding="utf-8") as f:
            raw = f.read()
        html_body = md_to_html(raw)
        full_html = wrap_html(title, html_body)
        for dest in dests:
            dest_p = export_dir / dest
            with open(dest_p, "w", encoding="utf-8") as f:
                f.write(full_html)
            print(f"[✓] Çıktı Alınabilir Dosya Oluşturuldu: {dest}")

