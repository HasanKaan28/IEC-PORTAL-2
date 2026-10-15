#!/usr/bin/env python3
"""
IEC Observatory Public Tunnel & Share Link
Starts a local background HTTP server and creates an instant public HTTPS tunnel
so the team and external members can view the live observatory on any device.
"""

import sys
import subprocess
import time
import re
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent

def main():
    print("==================================================")
    print(" 🛰️ IEC Observatory Public Tunnel Service")
    print("==================================================")
    
    # 1. Update index.html from graphify-out
    src = WORKSPACE_ROOT / "graphify-out" / "graph.html"
    dst = WORKSPACE_ROOT / "index.html"
    if src.exists():
        dst.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
        print("[✓] index.html güncellendi.")

    # 2. Check if local server is running on 8085
    import urllib.request
    server_running = False
    try:
        urllib.request.urlopen("http://localhost:8085/", timeout=2)
        server_running = True
        print("[✓] Yerel sunucu aktif: http://localhost:8085")
    except Exception:
        print("[*] Yerel sunucu başlatılıyor (port 8085)...")
        subprocess.Popen(
            [sys.executable, "-m", "http.server", "8085", "--directory", str(WORKSPACE_ROOT)],
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform.startswith("win") else 0
        )
        time.sleep(1.5)

    # 3. Launch Pinggy tunnel
    print("[*] Canlı HTTPS tüneli açılıyor...")
    cmd = ["ssh", "-p", "443", "-R0:localhost:8085", "a.pinggy.io", "-o", "StrictHostKeyChecking=no"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8")
    
    tunnel_url = None
    start_time = time.time()
    while time.time() - start_time < 15:
        line = proc.stdout.readline()
        if not line:
            break
        m = re.search(r'(https://[a-zA-Z0-9-]+\.(?:free\.pinggy\.net|run\.pinggy-free\.link))', line)
        if m:
            tunnel_url = m.group(1)
            break
        if "https://" in line:
            for part in line.split():
                if part.startswith("https://") and "pinggy" in part:
                    tunnel_url = part.strip()
                    break
            if tunnel_url:
                break

    if tunnel_url:
        print("\n🎉 CANLI HERKESE AÇIK LİNK HAZIR:")
        print(f"👉 {tunnel_url}")
        print("\nBu linki yönetim kuruluna veya WhatsApp grubuna doğrudan atabilirsiniz.")
        print("Tüneli kapatmak için Ctrl + C yapabilirsiniz.\n")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n[*] Tünel sonlandırıldı.")
    else:
        print("[!] Tünel URL'i alınamadı, yerel adresi kontrol edin.")

if __name__ == "__main__":
    main()
