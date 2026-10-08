"""
Shared helpers for the check scripts.

Safety rules (they never touch existing work):
- refuse to run, with exit code 2, if any page or testimonial already has a draft;
- refuse to run if one of the dedicated test documents already exists;
- write only to dedicated test documents (ids starting with "solution-check-" or "testimonial-check-");
- clean up in a finally block, deleting with ifRevisionId so a newer change is never overwritten.

Environment: SANITY_PROJECT_ID, SANITY_DATASET, SITE_URL (with trailing slash), STUDIO_URL.
The Studio session uses the Sanity CLI login token from ~/.config/sanity/config.json; it is never written anywhere.
"""
import json, os, sys, time, urllib.parse, urllib.request

PROJECT = os.environ['SANITY_PROJECT_ID']
DATASET = os.environ['SANITY_DATASET']
SITE = os.environ['SITE_URL'].rstrip('/')
STUDIO = os.environ.get('STUDIO_URL', '').rstrip('/')
TOKEN = json.load(open(os.path.expanduser('~/.config/sanity/config.json')))['authToken']
API = f'https://{PROJECT}.api.sanity.io/v2026-10-01/data'
TEST_PREFIXES = ('solution-check-', 'testimonial-check-')


def _call(url, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req))


def query(groq, params=None, perspective='raw'):
    qs = {'query': groq, 'perspective': perspective}
    for k, v in (params or {}).items():
        qs[f'${k}'] = json.dumps(v)
    return _call(f'{API}/query/{DATASET}?{urllib.parse.urlencode(qs)}')['result']


def mutate(mutations):
    return _call(f'{API}/mutate/{DATASET}?returnIds=true&visibility=sync', {'mutations': mutations})


def guard(test_ids):
    """Stops the script before any write if it could touch someone's work."""
    drafts = query('*[_id in path("drafts.**") && _type in ["landing", "solution", "testimonial"]]._id')
    drafts = [d for d in drafts if not d.removeprefix('drafts.').startswith(TEST_PREFIXES)]
    if drafts:
        print(f'Refusing to run: these documents have unpublished drafts: {", ".join(drafts)}. Publish or discard them first.')
        sys.exit(2)
    taken = query('*[_id in $ids]._id', {'ids': test_ids + [f'drafts.{i}' for i in test_ids]})
    if taken:
        print(f'Refusing to run: test documents already exist: {", ".join(taken)}. Delete them first.')
        sys.exit(2)


def cleanup(test_ids):
    """Deletes the script's own test documents, each guarded by its current revision."""
    for doc in query('*[_id in $ids]{_id, _rev}', {'ids': test_ids + [f'drafts.{i}' for i in test_ids]}):
        assert doc['_id'].removeprefix('drafts.').startswith(TEST_PREFIXES)
        # The no-op patch carries ifRevisionId: the transaction fails if the document changed since it was read.
        mutate([{'patch': {'id': doc['_id'], 'ifRevisionId': doc['_rev'], 'set': {}}}, {'delete': {'id': doc['_id']}}])


class Results:
    """Collects named checks with their expected values; exit code 1 if any mandatory check fails."""

    def __init__(self, name):
        self.name, self.checks = name, []

    def check(self, label, actual, expected=True, mandatory=True):
        ok = actual == expected if not callable(expected) else bool(expected(actual))
        self.checks.append({'check': label, 'ok': ok, 'actual': actual, 'mandatory': mandatory})
        print(('PASS ' if ok else 'FAIL ') + label + ('' if ok else f'  (got {actual!r})'))
        return ok

    def failed(self):
        return [c['check'] for c in self.checks if c['mandatory'] and not c['ok']]

    def finish(self, out_dir):
        os.makedirs(out_dir, exist_ok=True)
        report = {'script': self.name, 'site': SITE, 'dataset': DATASET, 'finished': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                  'passed': not self.failed(), 'checks': self.checks}
        json.dump(report, open(os.path.join(out_dir, f'{self.name}.json'), 'w'), indent=2)
        print(f'{self.name}: {"all mandatory checks passed" if report["passed"] else "FAILED: " + ", ".join(self.failed())}')
        sys.exit(0 if report['passed'] else 1)


def studio_context(browser, w=1440, h=900):
    ctx = browser.new_context(viewport={'width': w, 'height': h})
    ctx.add_init_script(f"localStorage.setItem('__studio_auth_token_{PROJECT}', JSON.stringify({{token: '{TOKEN}', time: new Date().toISOString()}}))")
    return ctx
