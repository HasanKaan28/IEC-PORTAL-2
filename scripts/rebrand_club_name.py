#!/usr/bin/env python3
"""
Systematic rebrand from 'IUS Engineering Club (IEC)' to 'IUS Engineering Club (IEC)'.
Preserves git URLs, paths, and Linear workspace slugs intact.
"""

import os
import sys
import re
from pathlib import Path

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent

# Files and directories to process
TARGET_EXTS = {'.md', '.py', '.html', '.json', '.txt'}
EXCLUDE_DIRS = {'.git', '.agents', 'node_modules', '__pycache__', 'docx_temp'}

REPLACEMENTS = [
    # Full club name variants
    (r"IUS Engineering Club \(IEC\)", "IUS Engineering Club (IEC)"),
    (r"IUS ENGINEERING CLUB \(IEC\)", "IUS ENGINEERING CLUB (IEC)"),
    (r"IUS Engineering Club", "IUS Engineering Club"),
    (r"IUS ENGINEERING CLUB", "IUS ENGINEERING CLUB"),
    (r"Engineering Club", "Engineering Club"),
    (r"ENGINEERING CLUB", "ENGINEERING CLUB"),
    
    # Bosnian / Croatian / Serbian
    (r"Inženjerski klub IUS", "Inženjerski klub IUS"),
    (r"Inzenjerski klub IUS", "Inzenjerski klub IUS"),
    
    # Turkish variants
    (r"IUS Mühendislik Kulübü", "IUS Mühendislik Kulübü"),
    (r"IUS Mühendislik Kulübü", "IUS Mühendislik Kulübü"),
    (r"Mühendislik Kulübü", "Mühendislik Kulübü"),
    (r"Mühendislik Kulübü", "Mühendislik Kulübü"),
    
    # Acronym IEC -> IEC
    (r"\bIEEC\b", "IEC"),
]

def process_file(file_path):
    # Skip binary files or specific files
    if file_path.suffix not in TARGET_EXTS:
        return 0

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return 0

    # Protect URLs that have ius-engineering-events slug
    url_placeholders = {}
    def url_sub(match):
        idx = len(url_placeholders)
        key = f"__PROTECTED_URL_{idx}__"
        url_placeholders[key] = match.group(0)
        return key

    # Protect urls and paths
    protected_content = re.sub(r'https?://[^\s)\]">]+', url_sub, content)
    protected_content = re.sub(r'[\w\\/.-]*ius-engineering-events[\w\\/.-]*', url_sub, protected_content)

    new_content = protected_content
    total_matches = 0

    for pattern, replacement in REPLACEMENTS:
        matches = len(re.findall(pattern, new_content))
        if matches > 0:
            total_matches += matches
            new_content = re.sub(pattern, replacement, new_content)

    # Restore protected URLs
    for key, original in url_placeholders.items():
        new_content = new_content.replace(key, original)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[✓] Rebranded {file_path.relative_to(WORKSPACE_ROOT)} ({total_matches} changes)")
        return total_matches

    return 0

def run():
    total_files = 0
    total_changes = 0
    for root, dirs, files in os.walk(WORKSPACE_ROOT):
        # Filter directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            fp = Path(root) / f
            c = process_file(fp)
            if c > 0:
                total_files += 1
                total_changes += c

    print(f"\nCompleted: {total_changes} replacements across {total_files} files.")

if __name__ == '__main__':
    run()
