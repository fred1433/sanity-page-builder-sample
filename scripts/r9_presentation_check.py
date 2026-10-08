"""
R9 acceptance checks for Presentation, run against the deployed site and the hosted Studio.

1. Clicking rendered content selects the right field in the Studio.
2. An unpublished value updates the preview.
3. A separate, logged-out browser session keeps showing the published value.
4. Publishing updates the public page without a redeploy.

The Studio session uses the Sanity CLI login token (read from ~/.config/sanity/config.json, never stored).
The script restores the original heading at the end.

Usage: python r9_presentation_check.py <out_dir>
"""
import json, os, sys, time, urllib.request, urllib.parse
from playwright.sync_api import sync_playwright

PROJECT = os.environ.get('SANITY_PROJECT_ID', 'vg4jfonv')
DATASET = os.environ.get('SANITY_DATASET', 'production')
STUDIO = os.environ.get('STUDIO_URL', 'https://orvane-sample.sanity.studio')
SITE = os.environ.get('SITE_URL', 'https://theaipipe.com/demos/kota-sanity/')
TOKEN = json.load(open(os.path.expanduser('~/.config/sanity/config.json')))['authToken']
out = sys.argv[1]
os.makedirs(out, exist_ok=True)
results = {}


def api(path, body=None):
    url = f'https://{PROJECT}.api.sanity.io/v2026-10-01/{path}'
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
                                 headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req))


def published_heading():
    q = urllib.parse.quote('*[_id=="landing"][0].sections[_type=="hero"][0]{_key, heading}')
    return api(f'data/query/{DATASET}?query={q}&perspective=published')['result']


def public_text(browser):
    ctx = browser.new_context()  # fresh, logged-out session
    pg = ctx.new_page()
    pg.goto(SITE + f'?nocache={time.time()}', wait_until='networkidle')
    txt = pg.locator('h1').first.inner_text()
    ctx.close()
    return txt


hero = published_heading()
original = hero['heading']
edited = original.rstrip('.') + ', checked.'

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 1440, 'height': 900})
    ctx.add_init_script(f"localStorage.setItem('__studio_auth_token_{PROJECT}', JSON.stringify({{token: '{TOKEN}', time: new Date().toISOString()}}))")
    pg = ctx.new_page()
    pg.goto(f'{STUDIO}/presentation', wait_until='domcontentloaded')
    for _ in range(60):
        frame = next((f for f in pg.frames if SITE.split('://')[1].rstrip('/') in f.url), None)
        if frame and frame.locator('h1').count():
            break
        time.sleep(1)
    try:
        pg.get_by_role('button', name='Got it').click(timeout=3000)
    except Exception:
        pass
    time.sleep(4)
    preview = pg.frame_locator('iframe[src*="theaipipe.com"], iframe[src*="localhost"]').first
    pg.screenshot(path=f'{out}/r9_0_loaded.png')
    print('frames', [f.url[:90] for f in pg.frames])

    # 1. click on the rendered heading
    preview.locator('h1').first.click()
    time.sleep(4)
    focused = pg.evaluate('document.activeElement && (document.activeElement.value || document.activeElement.textContent || "")')
    results['1_click_selects_field'] = {
        'studio_url_mentions_heading': f'{hero["_key"]}' in urllib.parse.unquote(pg.url) and 'heading' in urllib.parse.unquote(pg.url),
        'focused_field_value_is_heading': original in (focused or ''),
        'studio_url': urllib.parse.unquote(pg.url)[-140:],
    }
    pg.screenshot(path=f'{out}/r9_1_click.png')

    # 2. type an unpublished value
    pg.keyboard.press('Meta+A')
    pg.keyboard.type(edited, delay=10)
    ok2 = False
    for _ in range(30):
        time.sleep(1)
        if edited in preview.locator('h1').first.inner_text():
            ok2 = True
            break
    results['2_unpublished_value_updates_preview'] = ok2
    pg.screenshot(path=f'{out}/r9_2_draft.png')

    # 3. public, logged-out session still shows the published value
    pub = public_text(b)
    results['3_public_session_shows_published'] = (original in pub) and (edited not in pub)

    # 4. publish and wait for the public page
    pg.get_by_role('button', name='Publish').last.click()
    ok4, waited = False, 0
    for waited in range(0, 90, 3):
        time.sleep(3)
        if edited in public_text(b):
            ok4 = True
            break
    results['4_publish_updates_public_page'] = {'ok': ok4, 'seconds': waited + 3}
    pg.screenshot(path=f'{out}/r9_4_published.png')
    b.close()

# restore the original heading (published) and drop any leftover draft
api(f'data/mutate/{DATASET}', {'mutations': [
    {'patch': {'id': 'landing', 'set': {f'sections[_key=="{hero["_key"]}"].heading': original}}},
    {'delete': {'id': 'drafts.landing'}},
]})
results['restored'] = published_heading()['heading'] == original
print(json.dumps(results, indent=2))
json.dump(results, open(f'{out}/r9_results.json', 'w'), indent=2)
