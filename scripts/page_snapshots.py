"""
Full-page captures of every published page at desktop and phone widths.
Used before and after a change to show that existing pages are untouched.
Usage: SITE_URL=https://.../ python page_snapshots.py <out_dir>
Exit code 1 if any page overflows horizontally.
"""
import os, sys, time
from playwright.sync_api import sync_playwright

SITE = os.environ['SITE_URL'].rstrip('/')
PAGES = ['/', '/solutions/cash-visibility/', '/solutions/forecasting/']
out = sys.argv[1]
overflowing = []
os.makedirs(out, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in [(1440, 900), (390, 844)]:
        pg = b.new_page(viewport={'width': w, 'height': h})
        for path in PAGES:
            # The live preview connection keeps the network busy, so wait for load and a short settle instead of networkidle.
            pg.goto(SITE + path, wait_until='load')
            time.sleep(2.5)
            name = path.strip('/').split('/')[-1] or 'home'
            pg.screenshot(path=f'{out}/{name}-{w}.jpg', full_page=True, type='jpeg', quality=72)
            overflow = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth')
            print(f'{name}-{w}', 'horizontal overflow' if overflow else 'ok')
            if overflow:
                overflowing.append(f'{name}-{w}')
        pg.close()
    b.close()
sys.exit(1 if overflowing else 0)
