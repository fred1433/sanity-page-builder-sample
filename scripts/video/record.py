"""
Records the editor workflow video in segments with Playwright, captions drawn into the pages.
Run: SITE_URL=... STUDIO_URL=... python record.py <work_dir>
Writes <work_dir>/segments.json (file, start offset, duration) for assemble.sh.
The Studio session uses the Sanity CLI login token, read from ~/.config/sanity/config.json and never stored.
"""
import json, os, sys, time
from playwright.sync_api import sync_playwright

SITE = os.environ['SITE_URL'].rstrip('/')
STUDIO = os.environ['STUDIO_URL'].rstrip('/')
REPO_COMMIT = os.environ['COMMIT_URL']
PROJECT = os.environ.get('SANITY_PROJECT_ID', 'vg4jfonv')
TOKEN = json.load(open(os.path.expanduser('~/.config/sanity/config.json')))['authToken']
NEW_HEADING = 'Every bank, every entity, one cash position by 8am.'
work = sys.argv[1]
os.makedirs(work, exist_ok=True)
segments = []

CAPTION_JS = """([text, where, size]) => {
  let el = document.getElementById('__cap_' + where);
  if (!el) {
    el = document.createElement('div');
    el.id = '__cap_' + where;
    Object.assign(el.style, {position: 'fixed', left: '50%', transform: 'translateX(-50%)', zIndex: 2147483647,
      background: '#0e2b2a', color: '#fbfcf9', font: `600 ${size}px/1.3 "Helvetica Neue", Arial, sans-serif`,
      padding: '12px 22px', borderRadius: '3px', maxWidth: '86%', textAlign: 'center', boxShadow: '0 8px 28px rgba(0,0,0,.28)',
      pointerEvents: 'none'});
    el.style[where === 'top' ? 'top' : 'bottom'] = where === 'top' ? '64px' : '26px';
    document.documentElement.appendChild(el);
  }
  el.textContent = text;
  el.style.display = text ? 'block' : 'none';
}"""


def cap(pg, text, where='bottom', size=22):
    pg.evaluate(CAPTION_JS, [text, where, size])


def studio_context(b, w, h):
    ctx = b.new_context(viewport={'width': w, 'height': h}, record_video_dir=work, record_video_size={'width': w, 'height': h})
    ctx.add_init_script(f"localStorage.setItem('__studio_auth_token_{PROJECT}', JSON.stringify({{token: '{TOKEN}', time: new Date().toISOString()}}))")
    # Hide the Studio's product announcement card, which has nothing to do with the workflow.
    ctx.add_init_script("""setInterval(() => { for (const el of document.querySelectorAll('div, a, button')) {
      if (el.childElementCount < 4 && /^What.s new/.test((el.innerText || '').trim())) {
        let n = el; while (n && n !== document.body && getComputedStyle(n).position !== 'fixed') n = n.parentElement;
        (n && n !== document.body ? n : el).style.display = 'none'; } } }, 300)""")
    return ctx


def wait_preview(pg):
    for _ in range(90):
        f = next((f for f in pg.frames if 'theaipipe.com' in f.url or 'localhost' in f.url), None)
        if f and f.locator('h1').count():
            return
        time.sleep(1)


def dismiss(pg):
    for name in ['Got it', 'Close']:
        try:
            pg.get_by_role('button', name=name).first.click(timeout=1500)
        except Exception:
            pass
    pg.add_style_tag(content='[data-ui="Toast"], [data-ui="ToastProvider"] {display:none!important}')


def mark(name, page, t_page, start, dur):
    segments.append({'name': name, 'video': None, 'page': page, 'start': round(start - t_page, 2), 'duration': dur})


with sync_playwright() as p:
    b = p.chromium.launch()

    # 1a. finished page, desktop
    ctx = b.new_context(viewport={'width': 1440, 'height': 900}, record_video_dir=work, record_video_size={'width': 1440, 'height': 900})
    pg = ctx.new_page(); t_page = time.time()
    pg.goto(SITE + '/', wait_until='load'); time.sleep(2.5)
    cap(pg, 'A sample site for a fictional treasury company, built with Sanity and Next.js.')
    start = time.time()
    time.sleep(1.6); pg.get_by_role('button', name='EUR', exact=True).click()
    time.sleep(1.6); pg.get_by_role('button', name='USD', exact=True).click()
    time.sleep(2.8)
    mark('1a', pg, t_page, start, 6); pages = [(pg, ctx)]

    # 1b. same page, phone
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, record_video_dir=work, record_video_size={'width': 390, 'height': 844})
    pg = ctx.new_page(); t_page = time.time()
    pg.goto(SITE + '/', wait_until='load'); time.sleep(2.5)
    cap(pg, 'The same page on a phone.', size=16)
    start = time.time()
    for y in range(0, 700, 35):
        pg.evaluate(f'window.scrollTo(0,{y})'); time.sleep(0.15)
    time.sleep(1)
    mark('1b', pg, t_page, start, 4); pages.append((pg, ctx))

    # 2 and 3. Presentation: click to field, live draft, add a section, validation, fix
    ctx = studio_context(b, 1440, 900)
    pg = ctx.new_page(); t_page = time.time()
    pg.goto(STUDIO + '/presentation', wait_until='domcontentloaded')
    wait_preview(pg); time.sleep(3); dismiss(pg)
    preview = pg.frame_locator('iframe[src*="theaipipe.com"], iframe[src*="localhost"]').first
    cap(pg, 'In the Studio, a click on the page opens the field behind it.')
    start = time.time()
    time.sleep(2.5)
    preview.locator('h1').first.click()
    time.sleep(2.3)
    pg.screenshot(path=os.path.join(work, 'poster.png'))
    cap(pg, 'The preview follows as you type. Nothing is public yet.')
    time.sleep(0.8)
    pg.keyboard.press('Meta+A')
    pg.keyboard.type(NEW_HEADING, delay=55)
    time.sleep(15 - (time.time() - start))
    mark('2', pg, t_page, start, 15)

    pg.get_by_role('button', name='Close dialog').first.click()  # close the hero opened by the click
    time.sleep(0.6)
    start = time.time()
    cap(pg, 'Sections come from a fixed list of approved types.')
    pg.get_by_role('button', name='Add item...').click()
    time.sleep(3)
    pg.get_by_role('menuitem', name='Hero').click()
    time.sleep(1.2)
    cap(pg, 'A second hero breaks the rules: no heading, not at the top. Publish is blocked.')
    time.sleep(4)
    pg.get_by_role('button', name='Close dialog').first.click()  # close the new item's dialog
    time.sleep(3.5)
    cap(pg, 'Removing the extra hero clears the errors.')
    toggle = pg.locator('[data-testid="field-sections"] [data-testid="array-items-toggle"]')
    if toggle.count() and 'Show all' in (toggle.first.inner_text() or ''):
        toggle.first.click(); time.sleep(0.8)
    pg.locator('[data-testid="field-sections"] [data-testid="array-item-menu-button"]').last.click()
    time.sleep(1.2)
    pg.get_by_role('menuitem', name='Remove').click()
    time.sleep(20 - (time.time() - start))
    mark('3', pg, t_page, start, 20); pages.append((pg, ctx))

    # 4. draft and public side by side, then publish
    ctx_s = studio_context(b, 960, 1200)
    ps = ctx_s.new_page(); t_s = time.time()
    ps.goto(STUDIO + '/presentation', wait_until='domcontentloaded')
    wait_preview(ps); time.sleep(3); dismiss(ps)
    ctx_p = b.new_context(viewport={'width': 960, 'height': 1200}, record_video_dir=work, record_video_size={'width': 960, 'height': 1200})
    pp = ctx_p.new_page(); t_p = time.time()
    pp.goto(SITE + '/', wait_until='load'); time.sleep(2.5)
    cap(ps, 'Draft, in the Studio', 'top', 30)
    cap(pp, 'Public site, signed out', 'top', 30)
    cap(pp, 'The public page still shows the published heading.', 'bottom', 26)
    start = time.time()
    time.sleep(6)
    cap(ps, 'Publish', 'bottom', 26)
    ps.locator('[data-testid="action-publish"]').click()
    time.sleep(3)
    cap(pp, 'Published. The next visit shows it, with no redeploy.', 'bottom', 26)
    pp.reload(wait_until='load'); time.sleep(2)
    cap(pp, 'Published. The next visit shows it, with no redeploy.', 'bottom', 26)
    cap(pp, 'Public site, signed out', 'top', 30)
    cap(ps, '', 'bottom', 26)
    time.sleep(3)
    t = pp.locator('.testimonials')
    if t.count():
        y = pp.evaluate("document.querySelector('.testimonials').getBoundingClientRect().top + window.scrollY - 140")
        for i in range(1, 16):
            pp.evaluate(f'window.scrollTo(0,{y * i / 15})'); time.sleep(0.08)
        cap(pp, 'The new testimonials section, now live.', 'bottom', 26)
    time.sleep(20 - (time.time() - start))
    segments.append({'name': '4L', 'page': ps, 'start': round(start - t_s, 2), 'duration': 20})
    segments.append({'name': '4R', 'page': pp, 'start': round(start - t_p, 2), 'duration': 20})
    pages += [(ps, ctx_s), (pp, ctx_p)]

    # 5. another page intact, then the reviewed change
    ctx = b.new_context(viewport={'width': 1440, 'height': 900}, record_video_dir=work, record_video_size={'width': 1440, 'height': 900})
    pg = ctx.new_page(); t_page = time.time()
    pg.goto(SITE + '/solutions/cash-visibility/', wait_until='load'); time.sleep(2.5)
    cap(pg, 'Pages without the new section work exactly as before.')
    start = time.time()
    for y in range(0, 1300, 26):
        pg.evaluate(f'window.scrollTo(0,{y})'); time.sleep(0.1)
    time.sleep(8 - (time.time() - start))
    mark('5a', pg, t_page, start, 8); pages.append((pg, ctx))

    ctx = b.new_context(viewport={'width': 1440, 'height': 900}, record_video_dir=work, record_video_size={'width': 1440, 'height': 900})
    pg = ctx.new_page(); t_page = time.time()
    pg.goto(REPO_COMMIT, wait_until='load'); time.sleep(3)
    cap(pg, 'The testimonials section was added as a separate commit, then reviewed. Both are in the repository.')
    start = time.time(); time.sleep(3)
    pg.mouse.wheel(0, 500); time.sleep(4)
    mark('5b', pg, t_page, start, 7); pages.append((pg, ctx))

    for page, c in pages:
        c.close()
    for s in segments:
        s['video'] = s.pop('page').video.path()
    b.close()

json.dump(segments, open(os.path.join(work, 'segments.json'), 'w'), indent=2)
print(json.dumps(segments, indent=2))
