"""
Release checks on the deployed site and the hosted Studio.
1. Every page works signed out: status 200, no failed requests, no console errors.
2. Phone width: no horizontal overflow on any page.
3. Interactions: currency switch, walkthrough dialog and its video, navigation links.
4. Invalid content cannot be published from the Studio: a second hero added in the form, then drafts written through the API
   (CTA without a main button, statement card missing an amount, testimonial without attribution or with a blank name),
   against a valid control draft.
Draft/published separation and publish-without-redeploy are covered by r9_presentation_check.py.
Usage: SITE_URL=... STUDIO_URL=... python release_checks.py <out_dir>
"""
import json, os, sys, time, urllib.request
from playwright.sync_api import sync_playwright

SITE = os.environ['SITE_URL'].rstrip('/')
STUDIO = os.environ['STUDIO_URL'].rstrip('/')
PROJECT = os.environ['SANITY_PROJECT_ID']
TOKEN = json.load(open(os.path.expanduser('~/.config/sanity/config.json')))['authToken']
PAGES = ['/', '/solutions/cash-visibility/', '/solutions/forecasting/']
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
R = {}


def mutate(muts):
    r = urllib.request.Request(f'https://{PROJECT}.api.sanity.io/v2026-10-01/data/mutate/production', data=json.dumps({'mutations': muts}).encode(),
                               headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(r))


with sync_playwright() as p:
    b = p.chromium.launch()
    # 1 and 2
    for w, h in [(1440, 900), (390, 844)]:
        ctx = b.new_context(viewport={'width': w, 'height': h})
        pg = ctx.new_page()
        failed, errors = [], []
        # Aborted prefetches (?_rsc=) on navigation are expected and not counted.
        pg.on('requestfailed', lambda r: failed.append(r.url) if '_rsc=' not in r.url else None)
        pg.on('response', lambda r: failed.append(f'{r.status} {r.url}') if r.status >= 400 else None)
        pg.on('console', lambda m: errors.append(m.text[:160]) if m.type == 'error' else None)
        for path in PAGES:
            resp = pg.goto(SITE + path, wait_until='load'); time.sleep(1.5)
            key = f'{w}{path}'
            R[f'signed_out_{key}'] = resp.status
            R[f'overflow_{key}'] = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth')
        R[f'failed_requests_{w}'] = failed
        R[f'console_errors_{w}'] = errors
        ctx.close()

    # 3. interactions
    ctx = b.new_context(viewport={'width': 1440, 'height': 900}); pg = ctx.new_page()
    pg.goto(SITE + '/', wait_until='load')
    pg.get_by_role('button', name='USD', exact=True).click(); time.sleep(1.2)
    R['currency_switch'] = pg.locator('.note__figure .sr-only').inner_text()
    pg.get_by_role('button', name='Watch the editor workflow').click(); time.sleep(0.8)
    R['dialog_open'] = pg.evaluate("document.querySelector('dialog.walkthrough').open")
    pg.evaluate("document.querySelector('dialog.walkthrough video').play()"); time.sleep(3)
    R['video_playing'] = pg.evaluate("(() => { const v = document.querySelector('dialog.walkthrough video'); return {t: v.currentTime, d: v.duration, w: v.videoWidth} })()")
    pg.screenshot(path=f'{out}/dialog.png')
    pg.get_by_role('button', name='Close').click(); time.sleep(0.5)
    R['dialog_closed'] = not pg.evaluate("document.querySelector('dialog.walkthrough').open")
    pg.get_by_role('link', name='Forecasting').first.click(); pg.wait_for_url('**/solutions/forecasting/', timeout=15000)
    R['nav_forecasting'] = pg.url
    R['implementation_link'] = pg.get_by_role('link', name='View the implementation').get_attribute('href')
    ctx.close()

    # 4. validation blocks publishing in the Studio
    ctx = b.new_context(viewport={'width': 1440, 'height': 900})
    ctx.add_init_script(f"localStorage.setItem('__studio_auth_token_{PROJECT}', JSON.stringify({{token: '{TOKEN}', time: new Date().toISOString()}}))")
    pg = ctx.new_page()
    pg.goto(f'{STUDIO}/structure/solution;solution-cash-visibility', wait_until='domcontentloaded')
    pg.get_by_role('button', name='Add item...').wait_for(timeout=60000); time.sleep(2)
    pg.get_by_role('button', name='Add item...').click(); time.sleep(0.8)
    pg.get_by_role('menuitem', name='Hero').click(); time.sleep(1)
    pg.get_by_role('button', name='Close dialog').first.click(); time.sleep(4)
    R['second_hero_publish_disabled'] = pg.locator('[data-testid="action-publish"]').is_disabled()
    pg.screenshot(path=f'{out}/blocked_second_hero.png')
    mutate([{'delete': {'id': 'drafts.solution-cash-visibility'}}])

    # Object-level rules (CTA without a main button, statement card missing an amount) are checked in the Studio itself:
    # outside the Studio, the CLI downgrades object-level custom rules to warnings when it adds its unknown-fields check.
    cases = {
        'cta_without_main_button': [{'_key': 'a', '_type': 'hero', 'variant': 'plain', 'heading': 'Check'}, {'_key': 'b', '_type': 'cta', 'heading': 'No button', 'tone': 'ink'}],
        'statement_missing_amount': [{'_key': 'a', '_type': 'hero', 'variant': 'statement', 'heading': 'Check', 'figure': {'gbp': 5}}],
        'testimonial_without_attribution': {'quote': 'A quote with nobody attached to it.'},
        'blank_testimonial_name': {'quote': 'Words.', 'name': '   '},
        # Control: a valid draft must be publishable, so a disabled button above means validation, not something else.
        'valid_control': [{'_key': 'a', '_type': 'hero', 'variant': 'plain', 'heading': 'Check'}],
    }
    for name, sections in cases.items():
        doc_id = f'release-check-{name.replace("_", "-")}'
        if isinstance(sections, dict):
            mutate([{'createOrReplace': {'_id': f'drafts.{doc_id}', '_type': 'testimonial', **sections}}])
            url = f'{STUDIO}/structure/testimonial;{doc_id}'
        else:
            mutate([{'createOrReplace': {'_id': f'drafts.{doc_id}', '_type': 'solution', 'title': 'Check', 'slug': {'_type': 'slug', 'current': doc_id}, 'sections': sections}}])
            url = f'{STUDIO}/structure/solution;{doc_id}'
        pg.goto(url, wait_until='domcontentloaded')
        pg.locator('[data-testid="action-publish"]').wait_for(timeout=60000); time.sleep(5)
        R[f'{name}_publish_disabled'] = pg.locator('[data-testid="action-publish"]').is_disabled()
        pg.screenshot(path=f'{out}/blocked_{name}.png')
        mutate([{'delete': {'id': f'drafts.{doc_id}'}}])
    ctx.close(); b.close()

print(json.dumps(R, indent=2))
json.dump(R, open(f'{out}/release_results.json', 'w'), indent=2)
