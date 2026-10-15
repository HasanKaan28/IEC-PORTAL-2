#!/usr/bin/env python3
"""
Central path definitions and category router for IUS Engineering Club Desktop Hub.
All club-related documents, forms, exports, and assets reside in C:\\Users\\Kaan\\Desktop\\IEC.

Categories:
  01_Resmi_Basvuru_Formlari        -> Official Registration & SCC Forms
  02_Dekanlik_ve_Akademik_Danisman -> Deanery Proposal, Advisor Invitations
  03_Tuzuk_Butce_ve_Planlar        -> Constitution, Budget, Activity Plans
  04_Marka_Logo_ve_Tasarim         -> Logos, Banners, Posters, Brand Assets
  05_LinkedIn_ve_Sosyal_Medya      -> LinkedIn Guide, Social Media Media Kits
  06_Etkinlikler_ve_Workshoplar    -> Event Blueprints, Marshmallow Challenge, Hackathons
  07_Indirilenler_Downloads        -> Incoming external files, downloads, sponsor materials
"""

import os
import shutil
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
DESKTOP_DIR = Path(os.environ.get("USERPROFILE", r"C:\Users\Kaan")) / "Desktop"
DESKTOP_IEC_DIR = DESKTOP_DIR / "IEC"

# Category directories
DIR_01_FORMS = DESKTOP_IEC_DIR / "01_Resmi_Basvuru_Formlari"
DIR_02_ACADEMIC = DESKTOP_IEC_DIR / "02_Dekanlik_ve_Akademik_Danisman"
DIR_03_GOVERNANCE = DESKTOP_IEC_DIR / "03_Tuzuk_Butce_ve_Planlar"
DIR_04_BRANDING = DESKTOP_IEC_DIR / "04_Marka_Logo_ve_Tasarim"
DIR_05_SOCIAL = DESKTOP_IEC_DIR / "05_LinkedIn_ve_Sosyal_Medya"
DIR_06_EVENTS = DESKTOP_IEC_DIR / "06_Etkinlikler_ve_Workshoplar"
DIR_07_DOWNLOADS = DESKTOP_IEC_DIR / "07_Indirilenler_Downloads"

ALL_CATEGORIES = [
    DIR_01_FORMS,
    DIR_02_ACADEMIC,
    DIR_03_GOVERNANCE,
    DIR_04_BRANDING,
    DIR_05_SOCIAL,
    DIR_06_EVENTS,
    DIR_07_DOWNLOADS,
]

# Primary official files
FORM_F252_PRIMARY = DIR_01_FORMS / "student_club_registration_form_f252.docx"
FORM_F252_ROOT = DESKTOP_IEC_DIR / "student_club_registration_form_f252.docx"
DEANERY_PROPOSAL_PDF = DIR_02_ACADEMIC / "IUS_Engineering_Club_Deanery_Proposal.pdf"
LINKEDIN_GUIDE_DOCX = DIR_05_SOCIAL / "IUS_Engineering_Club_LinkedIn_Rehberi.docx"

def ensure_all_dirs():
    """Ensure all category directories exist."""
    DESKTOP_IEC_DIR.mkdir(parents=True, exist_ok=True)
    for cat_dir in ALL_CATEGORIES:
        cat_dir.mkdir(parents=True, exist_ok=True)

def get_download_path(filename: str) -> Path:
    """Return destination path in 07_Indirilenler_Downloads, ensuring dir exists."""
    DIR_07_DOWNLOADS.mkdir(parents=True, exist_ok=True)
    return DIR_07_DOWNLOADS / filename

def get_category_path(category_name: str, filename: str) -> Path:
    """Return path inside a specific category folder."""
    target_dir = DESKTOP_IEC_DIR / category_name
    target_dir.mkdir(parents=True, exist_ok=True)
    return target_dir / filename

def sync_form_f252_to_both_locations(src_path: str):
    """Keep both the category folder and IEC root synchronized for Form F252."""
    ensure_all_dirs()
    if os.path.exists(src_path):
        if Path(src_path) != FORM_F252_PRIMARY:
            shutil.copy2(src_path, FORM_F252_PRIMARY)
        if Path(src_path) != FORM_F252_ROOT:
            shutil.copy2(src_path, FORM_F252_ROOT)
