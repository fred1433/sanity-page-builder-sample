"""
Release checks on the deployed site and the hosted Studio.

1. Every page works signed out: status 200, no failed requests, no console errors.
2. No horizontal overflow at 1440 and 390 px.
3. Interactions: currency switch (announced to screen readers), walkthrough dialog at the video's 8:5 ratio, navigation.
4. Publishing rules in the Studio, on dedicated draft-only test documents written through the API:
   blocked: a second, fully valid hero; a CTA without a main button; a button label without a destination;
            a statement card missing an amount; slugs with a slash or a #; a testimonial without attribution or with a blank name;
   allowed: a valid control page; a hidden external address after switching to an internal link;
            an out-of-range amount hidden by the Plain layout.
The script refuses to run if any page or testimonial has a draft, and deletes its own test documents at the end.
Exit code: 0 when every check passes, 1 when one fails, 2 when it refuses to run.
Usage: SANITY_PROJECT_ID=... SANITY_DATASET=... SITE_URL=... STUDIO_URL=... python release_checks.py <out_dir>
"""
import sys, time
from playwright.sync_api import sync_playwright
from checks_common import SITE, STUDIO, Results, cleanup, guard, mutate, query, studio_context

PAGES = ['/', '/solutions/cash-visibility/', '/solutions/forecasting/']
out = sys.argv[1]
R = Results('release_checks')

hero = lambda key, heading='Check', **extra: {'_key': key, '_type': 'hero', 'variant': 'plain', 'heading': heading, **extra}
page_link = lambda label: {'_type': 'link', 'label': label, 'kind': 'internal', 'page': {'_type': 'reference', '_ref': 'landing'}}

CASES = {
    # name: (document fields, publish expected to be allowed)
    'second_valid_hero': ({'sections': [hero('a'), hero('b', 'A second hero, valid on its own', primary=page_link('Home'))]}, False),
    'cta_without_main_button': ({'sections': [hero('a'), {'_key': 'b', '_type': 'cta', 'heading': 'No button', 'tone': 'ink'}]}, False),
    'label_without_destination': ({'sections': [hero('a', primary={'_type': 'link', 'label': 'Book a walkthrough', 'kind': 'internal'})]}, False),
    'statement_missing_amount': ({'sections': [hero('a', variant='statement', figure={'gbp': 5})]}, False),
    'slug_with_slash': ({'slug_value': 'cash/visibility', 'sections': [hero('a')]}, False),
    'slug_with_hash': ({'slug_value': 'forecasting#2027', 'sections': [hero('a')]}, False),
    'testimonial_without_attribution': ({'testimonial': {'quote': 'A quote with nobody attached to it.'}}, False),
    'blank_testimonial_name': ({'testimonial': {'quote': 'Words.', 'name': '   '}}, False),
    'valid_control': ({'sections': [hero('a', primary=page_link('Home'))]}, True),
    'hidden_external_address': ({'sections': [hero('a', primary={**page_link('Home'), 'href': 'http://example.com'})]}, True),
    'hidden_out_of_range_amount': ({'sections': [hero('a', figure={'gbp': 10 ** 15, 'eur': 1, 'usd': 1})]}, True),
}
ids = {name: ('testimonial-check-' if 'testimonial' in spec[0] else 'solution-check-') + name.replace('_', '-') for name, spec in CASES.items()}

guard(list(ids.values()))
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        # 1 and 2
        for w, h in [(1440, 900), (390, 844)]:
            ctx = b.new_context(viewport={'width': w, 'height': h})
            pg = ctx.new_page()
            failed, errors = [], []
            # Prefetches aborted by the next navigation (?_rsc=) are expected and not counted.
            pg.on('requestfailed', lambda r: failed.append(r.url) if '_rsc=' not in r.url else None)
            pg.on('response', lambda r: failed.append(f'{r.status} {r.url}') if r.status >= 400 else None)
            pg.on('console', lambda m: errors.append(m.text[:160]) if m.type == 'error' else None)
            for path in PAGES:
                resp = pg.goto(SITE + path, wait_until='load'); time.sleep(1.5)
                R.check(f'{w}px {path} answers 200 signed out', resp.status, 200)
                R.check(f'{w}px {path} has no horizontal overflow', pg.evaluate('document.documentElement.scrollWidth <= window.innerWidth'))
            R.check(f'{w}px no failed requests', failed, [])
            R.check(f'{w}px no console errors', errors, [])
            ctx.close()

        # 3. interactions
        ctx = b.new_context(viewport={'width': 1440, 'height': 900}); pg = ctx.new_page()
        pg.goto(SITE + '/', wait_until='load')
        live = pg.locator('.note__figure [aria-live="polite"][aria-atomic="true"]')
        pg.get_by_role('button', name='USD', exact=True).click(); time.sleep(1.2)
        R.check('currency switch updates the announced amount', live.inner_text(), '$64,610,690 USD')
        pg.get_by_role('button', name='Watch the editor workflow').click(); time.sleep(0.8)
        R.check('walkthrough dialog opens', pg.evaluate("document.querySelector('dialog.walkthrough').open"))
        pg.evaluate("document.querySelector('dialog.walkthrough video').play()"); time.sleep(3)
        v = pg.evaluate("(() => { const v = document.querySelector('dialog.walkthrough video'); const r = v.getBoundingClientRect(); return {t: v.currentTime, ratio: r.width / r.height, src: v.videoWidth / v.videoHeight} })()")
        R.check('walkthrough video plays', v['t'], lambda t: t > 1)
        R.check('video box matches the 8:5 video', round(v['ratio'], 2), lambda r: abs(r - 1.6) < 0.02 and abs(v['src'] - 1.6) < 0.01)
        pg.screenshot(path=f'{out}/dialog.png')
        pg.get_by_role('button', name='Close').click(); time.sleep(0.5)
        R.check('walkthrough dialog closes', not pg.evaluate("document.querySelector('dialog.walkthrough').open"))
        pg.get_by_role('link', name='Forecasting').first.click(); pg.wait_for_url('**/solutions/forecasting/', timeout=15000)
        R.check('header link reaches Forecasting', pg.url, f'{SITE}/solutions/forecasting/')
        ctx.close()

        # 4. publishing rules, on draft-only test documents
        muts = []
        for name, (fields, _) in CASES.items():
            if 'testimonial' in fields:
                muts.append({'create': {'_id': f'drafts.{ids[name]}', '_type': 'testimonial', **fields['testimonial']}})
            else:
                slug = fields.get('slug_value', ids[name].removeprefix('solution-'))
                muts.append({'create': {'_id': f'drafts.{ids[name]}', '_type': 'solution', 'title': 'Check', 'slug': {'_type': 'slug', 'current': slug}, 'sections': fields['sections']}})
        mutate(muts)
        ctx = studio_context(b); pg = ctx.new_page()
        for name, (fields, allowed) in CASES.items():
            kind = 'testimonial' if 'testimonial' in fields else 'solution'
            pg.goto(f'{STUDIO}/structure/{kind};{ids[name]}', wait_until='domcontentloaded')
            pg.locator('[data-testid="action-publish"]').wait_for(timeout=60000); time.sleep(5)
            disabled = pg.locator('[data-testid="action-publish"]').is_disabled()
            R.check(f'publish {"allowed" if allowed else "blocked"}: {name.replace("_", " ")}', not disabled, allowed)
            pg.screenshot(path=f'{out}/studio_{name}.png')
        ctx.close(); b.close()
finally:
    cleanup(list(ids.values()))
R.check('cleanup: test documents removed', query('count(*[_id in $ids])', {'ids': [f'drafts.{i}' for i in ids.values()] + list(ids.values())}), 0)
R.finish(out)
