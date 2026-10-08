"""Used only to re-record the video. It rewrites the landing page and its draft, so run it on a dataset where that is fine.
Puts the landing page back in the state the recording starts from:
published without the testimonials section, draft = published + testimonials section, original heading."""
import json, os, urllib.request, urllib.parse
T = json.load(open(os.path.expanduser('~/.config/sanity/config.json')))['authToken']
base = f"https://{os.environ['SANITY_PROJECT_ID']}.api.sanity.io/v2026-10-01/data"
DATASET = os.environ['SANITY_DATASET']
HEADING = 'Every bank, every entity, one cash position before the morning call.'
def req(path, body=None):
    r = urllib.request.Request(base + path, data=json.dumps(body).encode() if body else None, headers={'Authorization': 'Bearer ' + T, 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(r))
q = urllib.parse.quote('*[_id in ["landing", "drafts.landing"]]')
docs = {d['_id']: d for d in req(f'/query/{DATASET}?query={q}&perspective=raw')['result']}
src = docs.get('drafts.landing') or docs['landing']
clean = {k: v for k, v in src.items() if k not in ('_rev', '_updatedAt', '_createdAt')}
for s in clean['sections']:
    if s['_type'] == 'hero': s['heading'] = HEADING
draft = dict(clean, _id='drafts.landing')
published = dict(clean, _id='landing', sections=[s for s in clean['sections'] if s['_type'] != 'testimonials'])
print(req(f'/mutate/{DATASET}?returnIds=true', {'mutations': [{'createOrReplace': published}, {'createOrReplace': draft}]})['results'])
