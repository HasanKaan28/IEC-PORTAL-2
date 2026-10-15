import time
import os
import win32gui
import win32con
from playwright.sync_api import sync_playwright

USER_DATA_DIR = os.path.expanduser(r"~\.edge_ai_profile")
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def focus_edge_window():
    time.sleep(1.5)
    def enum_handler(hwnd, extra):
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd)
            if any(k in title.lower() for k in ["linkedin", "edge", "profil", "kişisel", "work"]):
                try:
                    win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
                    win32gui.ShowWindow(hwnd, win32con.SW_MAXIMIZE)
                    win32gui.SetForegroundWindow(hwnd)
                    print(f"[FOCUS] Successfully brought to front: '{title}'")
                except Exception as e:
                    pass
        return True
    win32gui.EnumWindows(enum_handler, None)

HUD_AND_CURSOR_SCRIPT = """
(() => {
    let hud = document.getElementById('antigravity-live-hud');
    if (!hud) {
        hud = document.createElement('div');
        hud.id = 'antigravity-live-hud';
        hud.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 25px !important;
            z-index: 2147483647 !important;
            background: rgba(10, 15, 30, 0.95) !important;
            color: #00ffcc !important;
            border: 2px solid #00ffcc !important;
            border-radius: 12px !important;
            padding: 12px 20px !important;
            font-family: 'Segoe UI', system-ui, sans-serif !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            box-shadow: 0 0 30px rgba(0, 255, 204, 0.6) !important;
            pointer-events: none !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            backdrop-filter: blur(10px) !important;
        `;
        hud.innerHTML = `
            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#00ffcc; box-shadow:0 0 12px #00ffcc;"></span>
            <span>⚡ ANTIGRAVITY AI CANLI YONETIM AKTIF</span>
        `;
        document.body.appendChild(hud);

        let cursor = document.getElementById('ag-laser-pointer');
        if (!cursor) {
            cursor = document.createElement('div');
            cursor.id = 'ag-laser-pointer';
            cursor.style.cssText = `
                position: fixed !important;
                width: 24px !important;
                height: 24px !important;
                background: radial-gradient(circle, #ff0055 30%, rgba(255,0,85,0.4) 70%, transparent 100%) !important;
                border: 2px solid #ffffff !important;
                border-radius: 50% !important;
                pointer-events: none !important;
                z-index: 2147483647 !important;
                transform: translate(-50%, -50%) !important;
                box-shadow: 0 0 20px #ff0055 !important;
                transition: left 0.08s ease-out, top 0.08s ease-out !important;
            `;
            document.body.appendChild(cursor);
        }

        window.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }
})();
"""

def main():
    print("[*] Launching Microsoft Edge with window focus force...")
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=USER_DATA_DIR,
            executable_path=EDGE_PATH,
            headless=False,
            args=[
                "--start-maximized",
                "--no-first-run",
                "--no-default-browser-check",
            ],
            viewport=None,
        )
        context.add_init_script(HUD_AND_CURSOR_SCRIPT)
        page = context.pages[0] if context.pages else context.new_page()
        
        print("[*] Navigating to LinkedIn Company Creation Page...")
        page.goto("https://www.linkedin.com/company/setup/new/", wait_until="domcontentloaded")
        
        try:
            page.evaluate(HUD_AND_CURSOR_SCRIPT)
        except Exception:
            pass
            
        print("[*] Bringing Edge to front of screen...")
        focus_edge_window()
        
        print("\n[SUCCESS] Edge is currently active and focused on screen!")
        print("[*] Keeping process running...")
        
        try:
            while True:
                if len(context.pages) == 0:
                    break
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            context.close()

if __name__ == "__main__":
    main()
