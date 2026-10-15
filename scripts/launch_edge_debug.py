import subprocess
import time
import urllib.request
import json
import os

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
USER_DATA = os.path.expanduser(r"~\.edge_ai_profile")
PORT = 9224

def is_port_ready():
    try:
        url = f"http://127.0.0.1:{PORT}/json/version"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=2) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"[SUCCESS] Connected to Edge CDP on port {PORT}: {data.get('Browser')}")
            return True
    except Exception as e:
        return False

def launch_edge():
    if is_port_ready():
        print(f"Edge is already running on debug port {PORT}.")
        return True

    print(f"Launching Microsoft Edge with debug port {PORT}...")
    cmd = [
        EDGE_PATH,
        f"--remote-debugging-port={PORT}",
        f"--user-data-dir={USER_DATA}",
        "--no-first-run",
        "--no-default-browser-check",
        "https://www.linkedin.com",
    ]
    proc = subprocess.Popen(cmd)
    
    # Wait up to 10 seconds for CDP to respond
    for _ in range(20):
        time.sleep(0.5)
        if is_port_ready():
            return True
    print("[ERROR] Timeout waiting for Edge debug port.")
    return False

if __name__ == "__main__":
    launch_edge()
