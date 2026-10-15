import docx

doc = docx.Document(r'data\student_club_registration_form_f252_ORIGINAL_BACKUP.docx')
with open(r'scripts\inspect_original_backup.txt', 'w', encoding='utf-8') as f:
    for t_idx, t in enumerate(doc.tables):
        f.write(f'\n=== TABLE {t_idx} (rows: {len(t.rows)}, cols: {len(t.columns)}) ===\n')
        for r_idx, row in enumerate(t.rows):
            row_vals = [f'C{c_idx}: "{cell.text.strip().replace(chr(10), " ")}"' for c_idx, cell in enumerate(row.cells)]
            f.write(f'  R[{r_idx}]: {" | ".join(row_vals)}\n')
print('Saved original backup inspection')
