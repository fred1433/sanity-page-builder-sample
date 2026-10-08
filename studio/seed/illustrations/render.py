"""Renders the seed illustrations to PNG with a local headless browser."""
import pathlib
from playwright.sync_api import sync_playwright
here = pathlib.Path(__file__).parent
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1200, 'height': 900}, device_scale_factor=1.5)
    for name in ['statement', 'approvals']:
        pg.goto((here / f'{name}.html').as_uri(), wait_until='networkidle')
        pg.screenshot(path=str(here.parent / 'images' / f'{name}.png'))
    b.close()
