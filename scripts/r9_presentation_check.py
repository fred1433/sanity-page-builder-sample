"""
Presentation acceptance checks (R9), on a dedicated test page, against the deployed site and hosted Studio.

1. Clicking rendered content selects the right field in the Studio.
2. An unpublished value updates the preview.
3. A separate, signed-out session keeps showing the published value.
4. Publishing updates the public page without a redeploy.
5. Outside the Studio, Draft Mode shows a "Draft preview · Exit preview" control; leaving it shows the published value.
   Inside the Studio's preview the control is absent.

The test page (solution-check-sample) is created by the script, published, edited, then deleted. No other document is
written. The script refuses to run if any page or testimonial has a draft (see checks_common.py).
Exit code: 0 when every check passes, 1 when one fails, 2 when it refuses to run.
Usage: SANITY_PROJECT_ID=... SANITY_DATASET=... SITE_URL=... STUDIO_URL=... python r9_presentation_check.py <out_dir>
"""
import sys, time, urllib.parse
from playwright.sync_api import sync_playwright
from checks_common import SITE, STUDIO, Results, cleanup, guard, mutate, query, studio_context

TEST_ID = 'solution-check-sample'
SLUG = 'check-sample'
PAGE = f'{SITE}/solutions/{SLUG}/'
ORIGINAL = 'A page that exists only while the checks run.'
EDITED = 'A page that exists only while the checks run, edited.'
out = sys.argv[1]
R = Results('r9_presentation_check')


def public_heading(browser, url=PAGE):
    ctx = browser.new_context()  # fresh, signed out
    pg = ctx.new_page()
    resp = pg.goto(f'{url}?nocache={time.time()}', wait_until='load')
    text = pg.locator('h1').first.inner_text() if resp and resp.ok else f'HTTP {resp.status if resp else "none"}'
    ctx.close()
    return text


guard([TEST_ID])
try:
    created = mutate([{'create': {
        '_id': TEST_ID, '_type': 'solution', 'title': 'Check sample', 'slug': {'_type': 'slug', 'current': SLUG},
        'sections': [{'_key': 'hero1', '_type': 'hero', 'variant': 'plain', 'heading': ORIGINAL}],
    }}])
    with sync_playwright() as p:
        b = p.chromium.launch()
        for _ in range(20):
            if public_heading(b) == ORIGINAL:
                break
            time.sleep(2)
        R.check('test page published and served', public_heading(b), ORIGINAL)

        ctx = studio_context(b)
        pg = ctx.new_page()
        enable_urls = []
        pg.on('request', lambda r: enable_urls.append(r.url) if '/api/draft-mode/enable' in r.url else None)
        pg.goto(f'{STUDIO}/presentation?preview={urllib.parse.quote(PAGE)}', wait_until='domcontentloaded')
        preview = pg.frame_locator('iframe[src*="theaipipe.com"], iframe[src*="localhost"]').first
        preview.locator('h1').first.wait_for(timeout=90000)
        time.sleep(4)
        try:
            pg.get_by_role('button', name='Got it').click(timeout=2000)
        except Exception:
            pass
        R.check('5b. no draft control inside the Studio preview', preview.locator('.draftbar').count(), 0)

        # 1. click to field
        preview.locator('h1').first.click()
        time.sleep(4)
        studio_url = urllib.parse.unquote(pg.url)
        focused = pg.evaluate('document.activeElement && (document.activeElement.value || "")') or ''
        R.check('1. click opens the heading field', 'hero1' in studio_url and 'heading' in studio_url and ORIGINAL in focused)
        pg.screenshot(path=f'{out}/r9_1_click.png')

        # 2. unpublished value reaches the preview
        pg.keyboard.press('Meta+A')
        pg.keyboard.type(EDITED, delay=10)
        ok2 = False
        for _ in range(30):
            time.sleep(1)
            if EDITED in preview.locator('h1').first.inner_text():
                ok2 = True
                break
        R.check('2. unpublished value updates the preview', ok2)

        # 3. signed-out session still sees the published value
        R.check('3. signed-out session shows the published value', public_heading(b), ORIGINAL)

        # 5. draft control in a standalone tab, using the preview secret the Studio just issued
        if enable_urls:
            solo = b.new_context(viewport={'width': 1200, 'height': 800})
            sp = solo.new_page()
            secret = urllib.parse.parse_qs(urllib.parse.urlparse(enable_urls[-1]).query)['sanity-preview-secret'][0]
            qs = urllib.parse.urlencode({'sanity-preview-secret': secret, 'sanity-preview-perspective': 'drafts', 'sanity-preview-pathname': urllib.parse.urlparse(PAGE).path})
            sp.goto(f'{SITE}/api/draft-mode/enable/?{qs}', wait_until='load')
            time.sleep(3)
            R.check('5a. standalone draft tab shows the draft value', EDITED in sp.locator('h1').first.inner_text())
            R.check('5a. "Draft preview · Exit preview" control is shown', sp.locator('.draftbar').count() == 1 and 'Exit preview' in sp.locator('.draftbar').inner_text())
            sp.screenshot(path=f'{out}/r9_5_draft_bar.png')
            sp.get_by_role('link', name='Exit preview').click()
            sp.wait_for_load_state('load'); time.sleep(1)
            sp.goto(PAGE, wait_until='load'); time.sleep(1)
            R.check('5c. after Exit preview the published value is back and the control is gone',
                    sp.locator('h1').first.inner_text() == ORIGINAL and sp.locator('.draftbar').count() == 0)
            solo.close()
        else:
            R.check('5. the Studio issued a preview secret', False)

        # 4. publish, then the public page updates without a redeploy
        pg.locator('[data-testid="action-publish"]').click()
        ok4, waited = False, 0
        for waited in range(3, 93, 3):
            time.sleep(3)
            if public_heading(b) == EDITED:
                ok4 = True
                break
        R.check('4. publishing updates the public page without a redeploy', ok4)
        R.checks[-1]['seconds'] = waited
        pg.screenshot(path=f'{out}/r9_4_published.png')
        b.close()
finally:
    cleanup([TEST_ID])
R.check('cleanup: test page removed', query('count(*[_id in $ids])', {'ids': [TEST_ID, f'drafts.{TEST_ID}']}), 0)
R.finish(out)
