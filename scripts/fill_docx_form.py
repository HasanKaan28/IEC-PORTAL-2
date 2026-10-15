import os, sys, shutil, zipfile, xml.etree.ElementTree as ET

def fill_docx():
    cat_docx = r'C:\Users\Kaan\Desktop\IEC\01_Resmi_Basvuru_Formlari\student_club_registration_form_f252.docx'
    root_docx = r'C:\Users\Kaan\Desktop\IEC\student_club_registration_form_f252.docx'
    desk_docx = r'C:\Users\Kaan\Desktop\student_club_registration_form_f252.docx'

    if os.path.exists(cat_docx):
        src_docx = cat_docx
    elif os.path.exists(root_docx):
        src_docx = root_docx
    elif os.path.exists(desk_docx):
        src_docx = desk_docx
    else:
        print(f"File not found: {cat_docx}")
        return

    # Extract all files
    extract_dir = r'C:\Users\Kaan\.gemini\antigravity-ide\scratch\ius-engineering-events\data\docx_temp'
    if os.path.exists(extract_dir):
        shutil.rmtree(extract_dir)
    os.makedirs(extract_dir, exist_ok=True)

    with zipfile.ZipFile(src_docx, 'r') as z:
        z.extractall(extract_dir)

    doc_xml_path = os.path.join(extract_dir, 'word', 'document.xml')
    tree = ET.parse(doc_xml_path)
    root = tree.getroot()

    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    ET.register_namespace('w', ns['w'])

    def set_cell_text(tc, text):
        p = tc.find('w:p', ns)
        if p is None:
            p = ET.SubElement(tc, f"{{{ns['w']}}}p")
        for r in p.findall('w:r', ns):
            p.remove(r)
        new_r = ET.SubElement(p, f"{{{ns['w']}}}r")
        rPr = ET.SubElement(new_r, f"{{{ns['w']}}}rPr")
        rFonts = ET.SubElement(rPr, f"{{{ns['w']}}}rFonts")
        rFonts.set(f"{{{ns['w']}}}ascii", "Calibri")
        sz = ET.SubElement(rPr, f"{{{ns['w']}}}sz")
        sz.set(f"{{{ns['w']}}}val", "22")
        new_t = ET.SubElement(new_r, f"{{{ns['w']}}}t")
        new_t.text = text

    body = root.find('w:body', ns)

    # TABLE 0: Basic info
    tbls = root.findall('.//w:tbl', ns)
    if len(tbls) > 0:
        rows = tbls[0].findall('w:tr', ns)
        if len(rows) > 1:
            tcs = rows[1].findall('w:tc', ns)
            if len(tcs) > 0:
                set_cell_text(tcs[0], "IUS Engineering Club (IEC)")
        if len(rows) > 2:
            tcs = rows[2].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "[ X ] NEW")
        if len(rows) > 3:
            tcs = rows[3].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "2026 / 2027")

    # CLUB TYPE PARAGRAPHS (Between Table 0 and Table 1)
    for p in body.findall('w:p', ns):
        p_text = ''.join([t.text for t in p.iter(f"{{{ns['w']}}}t") if t.text])
        if 'AEC (Academic and Educational Club):' in p_text and not p_text.startswith('[ X ]'):
            for t in p.iter(f"{{{ns['w']}}}t"):
                if 'AEC' in t.text:
                    t.text = t.text.replace('AEC (Academic and Educational Club):', '[ X ] AEC (Academic and Educational Club):')
        elif 'CSC (Community Service Club):' in p_text and not p_text.startswith('[   ]'):
            for t in p.iter(f"{{{ns['w']}}}t"):
                if 'CSC' in t.text:
                    t.text = t.text.replace('CSC (Community Service Club):', '[   ] CSC (Community Service Club):')
        elif 'SRC (Spiritual and Religious Club):' in p_text and not p_text.startswith('[   ]'):
            for t in p.iter(f"{{{ns['w']}}}t"):
                if 'SRC' in t.text:
                    t.text = t.text.replace('SRC (Spiritual and Religious Club):', '[   ] SRC (Spiritual and Religious Club):')
        elif 'CC (Cultural Club):' in p_text and not p_text.startswith('[   ]'):
            for t in p.iter(f"{{{ns['w']}}}t"):
                if 'CC' in t.text:
                    t.text = t.text.replace('CC (Cultural Club):', '[   ] CC (Cultural Club):')
        elif 'RSC (Recreation and Sports Club):' in p_text and not p_text.startswith('[   ]'):
            for t in p.iter(f"{{{ns['w']}}}t"):
                if 'RSC' in t.text:
                    t.text = t.text.replace('RSC (Recreation and Sports Club):', '[   ] RSC (Recreation and Sports Club):')
        elif 'MAC (Media and Art Club):' in p_text and not p_text.startswith('[   ]'):
            for t in p.iter(f"{{{ns['w']}}}t"):
                if 'MAC' in t.text:
                    t.text = t.text.replace('MAC (Media and Art Club):', '[   ] MAC (Media and Art Club):')

    # TABLE 1: Purpose & Board
    if len(tbls) > 1:
        rows = tbls[1].findall('w:tr', ns)
        if len(rows) > 1:
            tcs = rows[1].findall('w:tc', ns)
            if len(tcs) > 0:
                purpose_text = "The IUS Engineering Club (IEC) is established as an Academic and Educational Club (AEC) under the Faculty of Engineering and Natural Sciences (FENS) to bridge university engineering education with real-world industrial practice through technical workshops, AI bootcamps, multidisciplinary student engineering project teams, and tech industry networking."
                set_cell_text(tcs[0], purpose_text)
        if len(rows) > 5:
            tcs = rows[5].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "Prof. Dr. Leila Miller")
        if len(rows) > 6:
            tcs = rows[6].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "Kaan Mete Şenyıldız")
        if len(rows) > 7:
            tcs = rows[7].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "Hasan Kaan Karabulut")
        if len(rows) > 8:
            tcs = rows[8].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "Mahmut İhsan Avcı")
        if len(rows) > 9:
            tcs = rows[9].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "Bekir Enes Çokbekler")
        if len(rows) > 10:
            tcs = rows[10].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "Bakir Bašić")

    # TABLE 2: Contact Information
    if len(tbls) > 2:
        rows = tbls[2].findall('w:tr', ns)
        if len(rows) > 2:
            tcs = rows[2].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "Kaan Mete Şenyıldız")
        if len(rows) > 3:
            tcs = rows[3].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "+90 553 113 11 98")
        if len(rows) > 4:
            tcs = rows[4].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "kmsenyildiz@gmail.com")
        if len(rows) > 6:
            tcs = rows[6].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "Prof. Dr. Leila Miller (Full Professor Dr.)")
        if len(rows) > 7:
            tcs = rows[7].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "033 957 -")
        if len(rows) > 8:
            tcs = rows[8].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "lmiller@ius.edu.ba (Assistant: itarhanis-papic@ius.edu.ba)")

    # TABLE 3: Member list (Rows 3..22) - 10 Normal Members (Excluding Executive Board)
    confirmed_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'confirmed_members.json')
    active_confirmed = []
    if os.path.exists(confirmed_file):
        try:
            import json
            with open(confirmed_file, 'r', encoding='utf-8') as f:
                cdata = json.load(f)
                active_confirmed = cdata.get('confirmed', [])
        except Exception:
            pass

    default_candidates = [
        ("Bilal Yusuf Şimşek", "Simsekbilal59@gmail.com", "250302196"),
        ("Nazlıcan Cebeci", "nazlii.cebeci@gmail.com", "250302243"),
        ("Muhammed Emin Tiryaki", "metiryaki@student.ius.edu.ba", "250302247"),
        ("Emin Efe Duman", "emnfdmn@gmail.com", "250302211"),
        ("Ahmed Hadzimurati", "260302051@student.ius.edu.ba", "260302051"),
        ("Ömer Arif Açıkel", "o.arifacikel@gmail.com", "250302232"),
        ("Mert Çınar Atalay", "atalayss301@gmail.com", "250302162"),
        ("Ferit Enes Seymenliler", "eenesseymenliler@gmail.com", "240302180"),
        ("Hüseyin Talha Seymenliler", "tseymenliler16@gmail.com", "240302179"),
        ("Muhammed Efe Ural", "uralefe10@gmail.com", "240302169"),
        ("Abdullah Uzun", "250201110@student.ius.edu.ba", "250201110"),
    ]

    members_data = []
    seen_ids = set()
    for c in active_confirmed:
        members_data.append((c["name"], c["email"], c["id"]))
        seen_ids.add(c["id"])
    for cand in default_candidates:
        if len(members_data) >= 10:
            break
        if cand[2] not in seen_ids:
            members_data.append(cand)
            seen_ids.add(cand[2])

    if len(tbls) > 3:
        rows = tbls[3].findall('w:tr', ns)
        # Populate the 10 normal members
        for i, m in enumerate(members_data):
            row_idx = 3 + i
            if row_idx < len(rows):
                tcs = rows[row_idx].findall('w:tc', ns)
                if len(tcs) > 3:
                    set_cell_text(tcs[0], str(i + 1))
                    set_cell_text(tcs[1], m[0])
                    set_cell_text(tcs[2], m[1])
                    set_cell_text(tcs[3], m[2])
                    if len(tcs) > 4:
                        set_cell_text(tcs[4], "")
        # Clear any rows beyond the active member roster (rows 11 to 20)
        for row_idx in range(3 + len(members_data), len(rows)):
            tcs = rows[row_idx].findall('w:tc', ns)
            for col_idx, tc in enumerate(tcs):
                set_cell_text(tc, "")

    # TABLE 4: APPROVED BY DEAN
    if len(tbls) > 4:
        rows = tbls[4].findall('w:tr', ns)
        if len(rows) > 3:
            tcs = rows[3].findall('w:tc', ns)
            if len(tcs) > 1:
                set_cell_text(tcs[1], "Assoc. Prof. Dr. Altijana Hromić-Jahjefendić")

    tree.write(doc_xml_path, encoding='utf-8', xml_declaration=True)

    out_export_filled = r'C:\Users\Kaan\.gemini\antigravity-ide\scratch\ius-engineering-events\export_documents\student_club_registration_form_f252_FILLED.docx'

    def make_zip(out_path):
        with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED) as zip_out:
            for foldername, subfolders, filenames in os.walk(extract_dir):
                for filename in filenames:
                    filepath = os.path.join(foldername, filename)
                    arcname = os.path.relpath(filepath, extract_dir)
                    zip_out.write(filepath, arcname)

    make_zip(out_export_filled)
    shutil.rmtree(extract_dir)
    print("Export copy generated safely in export_documents. User's Desktop files are PROTECTED and untouched.")

if __name__ == '__main__':
    fill_docx()
