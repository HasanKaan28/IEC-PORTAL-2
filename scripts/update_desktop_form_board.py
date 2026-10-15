import os
import shutil
import zipfile
import xml.etree.ElementTree as ET

def update_board_in_desktop_form():
    cat_docx = r'C:\Users\Kaan\Desktop\IEC\01_Resmi_Basvuru_Formlari\student_club_registration_form_f252.docx'
    root_docx = r'C:\Users\Kaan\Desktop\IEC\student_club_registration_form_f252.docx'
    desk_docx = r'C:\Users\Kaan\Desktop\student_club_registration_form_f252.docx'
    backup_docx = r'C:\Users\Kaan\.gemini\antigravity-ide\scratch\ius-engineering-events\data\student_club_registration_form_f252_USER_EDITED_BEFORE_BOARD_UPDATE.docx'
    export_copy = r'C:\Users\Kaan\.gemini\antigravity-ide\scratch\ius-engineering-events\export_documents\student_club_registration_form_f252_FILLED.docx'

    if os.path.exists(cat_docx):
        src_docx = cat_docx
    elif os.path.exists(root_docx):
        src_docx = root_docx
    elif os.path.exists(desk_docx):
        src_docx = desk_docx
    else:
        print(f"Error: Desktop file not found at {cat_docx}")
        return

    # 1. Accidental data loss prevention: backup the user-edited file
    shutil.copy2(src_docx, backup_docx)
    print(f"Safety backup created at: {backup_docx}")

    # 2. Extract into temp directory
    extract_dir = r'C:\Users\Kaan\.gemini\antigravity-ide\scratch\ius-engineering-events\data\docx_board_temp'
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

    # The 15 members:
    # 1-5: Executive / Management Board
    # 6-15: Founding & Active Members
    members_list = [
        # 1-5: Management Board
        ("1", "Kaan Mete Şenyıldız", "250302201@student.ius.edu.ba", "250302201"),
        ("2", "Hasan Kaan Karabulut", "250302195@student.ius.edu.ba", "250302195"),
        ("3", "Mahmut İhsan Avcı", "250302233@student.ius.edu.ba", "250302233"),
        ("4", "Bekir Enes Çokbekler", "250302229@student.ius.edu.ba", "250302229"),
        ("5", "Bakir Bašić", "260302030@student.ius.edu.ba", "260302030"),
        # 6-15: Active Members from existing roster
        ("6", "Emin Efe Duman", "250302211@student.ius.edu.ba", "250302211"),
        ("7", "Ahmed Hadzimurati", "260302051@student.ius.edu.ba", "260302051"),
        ("8", "Muhammed Efe Ural", "240302169@student.ius.edu.ba", "240302169"),
        ("9", "Hüseyin Talha Seymenliler", "240302179@student.ius.edu.ba", "240302179"),
        ("10", "Ferit Enes Seymenliler", "240302180@student.ius.edu.ba", "240302180"),
        ("11", "Abdullah Uzun", "250201110@student.ius.edu.ba", "250201110"),
        ("12", "Ömer Arif Açıkel", "250302232@student.ius.edu.ba", "250302232"),
        ("13", "Nazlıcan Cebeci", "250302243@student.ius.edu.ba", "250302243"),
        ("14", "Bilal Yusuf Şimşek", "250302196@student.ius.edu.ba", "250302196"),
        ("15", "Muhammed Emin Tiryaki", "250302247@student.ius.edu.ba", "250302247"),
        ("16", "Işıl Irmak Cihan", "240302254@student.ius.edu.ba", "240302254"),
    ]

    tbls = root.findall('.//w:tbl', ns)
    if len(tbls) <= 3:
        print("Error: Table 3 not found in document.")
        return

    # ONLY modify Table 3! All other tables (0, 1, 2, 4, 5) and paragraphs are completely UNTOUCHED.
    table_3 = tbls[3]
    rows = table_3.findall('w:tr', ns)
    print(f"Table 3 total rows: {len(rows)}")

    # Rows 3 to 18: Fill the 16 members
    for i, m in enumerate(members_list):
        row_idx = 3 + i
        if row_idx < len(rows):
            tcs = rows[row_idx].findall('w:tc', ns)
            if len(tcs) >= 4:
                set_cell_text(tcs[0], m[0]) # No.
                set_cell_text(tcs[1], m[1]) # Name
                set_cell_text(tcs[2], m[2]) # Email
                set_cell_text(tcs[3], m[3]) # Student ID
                if len(tcs) >= 5:
                    set_cell_text(tcs[4], "") # Blank for physical wet signature

    # Rows 19 to 22: Slots 17 to 20 (empty slots with slot numbers)
    for slot_num in range(17, 21):
        row_idx = 3 + (slot_num - 1)
        if row_idx < len(rows):
            tcs = rows[row_idx].findall('w:tc', ns)
            if len(tcs) >= 4:
                set_cell_text(tcs[0], str(slot_num))
                set_cell_text(tcs[1], "")
                set_cell_text(tcs[2], "")
                set_cell_text(tcs[3], "")
                if len(tcs) >= 5:
                    set_cell_text(tcs[4], "")

    tree.write(doc_xml_path, encoding='utf-8', xml_declaration=True)

    # Repack to docx
    def make_zip(out_path):
        with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED) as zip_out:
            for foldername, subfolders, filenames in os.walk(extract_dir):
                for filename in filenames:
                    filepath = os.path.join(foldername, filename)
                    arcname = os.path.relpath(filepath, extract_dir)
                    zip_out.write(filepath, arcname)

    make_zip(export_copy)
    shutil.rmtree(extract_dir)

    print("SUCCESS: Table 3 updated in export copy! User's Desktop files are PROTECTED.")
    print(f"Export copy updated: {export_copy}")

if __name__ == '__main__':
    update_board_in_desktop_form()
