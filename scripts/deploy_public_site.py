#!/usr/bin/env python3
"""
Deploy IUS Engineering Club public projects showcase website
to HasanKaan28/ius-engineering-events-site (Public GitHub Pages repo).

All private data, petitions, forms, certificates, and internal documents remain
strictly in the private repository HasanKaan28/ius-engineering-events.
The public repo contains ONLY the student projects showcase website.
"""

import os
import shutil
import subprocess
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
BUILD_DIR = WORKSPACE.parent / "site_build"
REPO_URL = "https://github.com/HasanKaan28/ius-engineering-events-site.git"

def main():
    print("[*] Preparing public site build directory (Projects Showcase ONLY)...")
    if BUILD_DIR.exists():
        shutil.rmtree(BUILD_DIR, ignore_errors=True)
    BUILD_DIR.mkdir(parents=True, exist_ok=True)

    PROJECTS_DIR = WORKSPACE / "projects"

    # 1. Copy projects showcase files to root of public site
    files_to_copy = [
        ("projects/index.html", "index.html"),
        ("projects/style.css", "style.css"),
        ("projects/app.js", "app.js"),
        ("projects/projects-data.js", "projects-data.js"),
    ]
    for src_rel, dst_rel in files_to_copy:
        src = WORKSPACE / src_rel
        if src.exists():
            shutil.copy2(src, BUILD_DIR / dst_rel)
            print(f"  [+] Copied {src_rel} -> {dst_rel}")

    # 2. Copy only project showcase assets (hero images)
    src_assets = PROJECTS_DIR / "assets"
    dst_assets = BUILD_DIR / "assets"
    if src_assets.exists():
        shutil.copytree(src_assets, dst_assets, dirs_exist_ok=True)
        print(f"  [+] Copied project assets/")

    # 3. Mirror into /projects/ directory so both root / and /projects/ URLs work seamlessly
    dst_projects = BUILD_DIR / "projects"
    dst_projects.mkdir(parents=True, exist_ok=True)
    for src_rel, dst_rel in files_to_copy:
        shutil.copy2(WORKSPACE / src_rel, dst_projects / Path(dst_rel).name)
    shutil.copytree(src_assets, dst_projects / "assets", dirs_exist_ok=True)
    print(f"  [+] Mirrored to /projects/ for seamless backward compatibility")

    # 4. Add .nojekyll for GitHub Pages
    (BUILD_DIR / ".nojekyll").write_text("", encoding="utf-8")
    print("  [+] Created .nojekyll")

    # 5. Add clean, professional README for public repository
    readme_content = """# IUS Engineering Club — Student Innovations Portfolio

Welcome to the official student projects and engineering innovation showcase of the **IUS Engineering Club** at the **International University of Sarajevo (IUS)**.

Explore our flagship student engineering initiatives, IoT energy stations, cafeteria digital menu systems, 24-hour hackathons, and hands-on AI workshops.

🌐 **Live Portfolio Website**: [https://hasankaan28.github.io/ius-engineering-events-site/](https://hasankaan28.github.io/ius-engineering-events-site/)

---
*International University of Sarajevo — Faculty of Engineering and Natural Sciences (FENS)*
"""
    (BUILD_DIR / "README.md").write_text(readme_content, encoding="utf-8")
    print("  [+] Created clean public README.md")

    # 6. Git init and force-push to public repo (replacing old contents completely)
    print("[*] Initializing fresh git repo in build directory...")
    subprocess.run(["git", "init"], cwd=BUILD_DIR, check=True)
    subprocess.run(["git", "config", "user.name", "HasanKaan28"], cwd=BUILD_DIR, check=True)
    subprocess.run(["git", "config", "user.email", "hasankaan28@users.noreply.github.com"], cwd=BUILD_DIR, check=True)
    subprocess.run(["git", "remote", "add", "origin", REPO_URL], cwd=BUILD_DIR, check=True)
    subprocess.run(["git", "checkout", "-B", "main"], cwd=BUILD_DIR, check=True)
    subprocess.run(["git", "add", "."], cwd=BUILD_DIR, check=True)
    subprocess.run(["git", "commit", "-m", "deploy: publish clean student projects showcase portfolio website"], cwd=BUILD_DIR, check=True)

    print("[*] Force-pushing clean build to HasanKaan28/ius-engineering-events-site main branch...")
    subprocess.run(["git", "push", "-f", "origin", "main"], cwd=BUILD_DIR, check=True)

    # 7. Enable/ensure GitHub Pages
    print("[*] Ensuring GitHub Pages on HasanKaan28/ius-engineering-events-site...")
    res = subprocess.run([
        "gh", "api", "--method", "POST",
        "-H", "Accept: application/vnd.github+json",
        "repos/HasanKaan28/ius-engineering-events-site/pages",
        "-f", "source[branch]=main",
        "-f", "source[path]=/"
    ], capture_output=True, text=True)
    if res.stdout:
        print(res.stdout)

    print("\n[SUCCESS] Public showcase repository deployed successfully to GitHub Pages!")
    print("Live Showcase URL: https://hasankaan28.github.io/ius-engineering-events-site/")

if __name__ == "__main__":
    main()
