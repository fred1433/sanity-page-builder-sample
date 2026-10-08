"""
Runs every check against the deployed site and writes one report, tied to the commit that is deployed.
Usage: SANITY_PROJECT_ID=... SANITY_DATASET=... SITE_URL=... STUDIO_URL=... python run_all_checks.py
Writes docs/checks/checks_<commit>.json (no tokens or identifiers beyond the public URLs). Exit code 0 only if all pass.
"""
import json, os, subprocess, sys, tempfile, time

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
commit = subprocess.check_output(['git', '-C', root, 'rev-parse', '--short', 'HEAD'], text=True).strip()
dirty = subprocess.check_output(['git', '-C', root, 'status', '--porcelain', '--', 'web', 'studio', 'scripts'], text=True).strip()
work = tempfile.mkdtemp(prefix='checks-')
codes = {}
for script in ['r9_presentation_check.py', 'release_checks.py']:
    codes[script] = subprocess.call([sys.executable, os.path.join(here, script), work], cwd=here)
reports = {}
for name in ['r9_presentation_check', 'release_checks']:
    path = os.path.join(work, f'{name}.json')
    reports[name] = json.load(open(path)) if os.path.exists(path) else {'passed': False, 'checks': []}
summary = {
    'verified_commit': commit,
    'working_tree_clean': not dirty,
    'site': os.environ['SITE_URL'],
    'studio': os.environ['STUDIO_URL'],
    'finished': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'exit_codes': codes,
    'passed': all(c == 0 for c in codes.values()),
    'reports': {k: {'passed': v.get('passed'), 'checks': [{'check': c['check'], 'ok': c['ok']} for c in v.get('checks', [])]} for k, v in reports.items()},
}
os.makedirs(os.path.join(root, 'docs', 'checks'), exist_ok=True)
out = os.path.join(root, 'docs', 'checks', f'checks_{commit}.json')
json.dump(summary, open(out, 'w'), indent=2)
print(f'{"ALL CHECKS PASSED" if summary["passed"] else "CHECKS FAILED"} for {commit}: {out}')
sys.exit(0 if summary['passed'] else 1)
