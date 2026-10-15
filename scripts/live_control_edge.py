import time
from playwright.sync_api import sync_playwright

def inspect_and_control():
    print("Connecting to live Microsoft Edge on port 9224...")
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp("http://localhost:9224")
        context = browser.contexts[0]
        page = context.pages[0] if context.pages else context.new_page()
        
        print(f"Connected! Current Page URL: {page.url}")
        print(f"Current Page Title: {page.title()}")
        
        # Inject a visual indicator showing that Antigravity AI is connected
        page.evaluate("""() => {
            let banner = document.getElementById('antigravity-hud');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'antigravity-hud';
                banner.style.position = 'fixed';
                banner.style.top = '10px';
                banner.style.right = '20px';
                banner.style.zIndex = '9999999';
                banner.style.backgroundColor = 'rgba(10, 15, 30, 0.95)';
                banner.style.color = '#00ffcc';
                banner.style.border = '2px solid #00ffcc';
                banner.style.borderRadius = '12px';
                banner.style.padding = '12px 24px';
                banner.style.fontFamily = 'monospace';
                banner.style.fontSize = '14px';
                banner.style.fontWeight = 'bold';
                banner.style.boxShadow = '0 0 25px rgba(0, 255, 204, 0.6)';
                banner.style.pointerEvents = 'none';
                banner.style.transition = 'all 0.3s ease';
                banner.innerHTML = '⚡ ANTIGRAVITY AI LIVE CONTROLLER CONNECTED';
                document.body.appendChild(banner);
            }
        }""")
        print("[SUCCESS] Injected Antigravity AI live HUD banner into the browser window!")

if __name__ == "__main__":
    inspect_and_control()
