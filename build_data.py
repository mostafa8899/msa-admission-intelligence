"""Publish aggregate metrics only. Original conversations stay outside this repository.

Usage: python build_data.py --analysis-dir /path/to/msa_admissions_v2
"""
import argparse
import calendar
import json
import sys
from pathlib import Path

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--analysis-dir', required=True, type=Path)
args = p.parse_args()
sys.path.insert(0, str(args.analysis_dir.resolve()))
import analysis as a

source = json.loads((args.analysis_dir / 'data/analytics_2026.json').read_text())
rows = a.candidates(source['visits'])
views = {}
for cohort in ('broad', 'strong'):
    group = rows if cohort == 'broad' else [r for r in rows if r['category'] == 'Admission signal']
    for period in ['all'] + [f'2026-{m:02}' for m in range(1, 10)]:
        selected = group if period == 'all' else [r for r in group if r['month'] == period]
        payload = {'meta': dict(source['meta']), 'visits': selected}
        if period != 'all':
            year, month = map(int, period.split('-'))
            payload['meta']['selection_start'] = f'{period}-01'
            payload['meta']['selection_end'] = f'{period}-{15 if month == 9 else calendar.monthrange(year, month)[1]:02}'
        views[f'{cohort}:{period}'] = a.analyze(payload, selected)
output = {
    'coverage': {'start': '2026-01-01', 'end': source['meta']['end_date'], 'timezone': 'Africa/Cairo'},
    'classification': 'Unvalidated deterministic rules; signals require human review',
    'views': views,
}
dest = Path(__file__).parent / 'dist/data.json'
dest.write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':'), allow_nan=False))
assert views['broad:all'] == json.loads((args.analysis_dir / 'data/decision_summary.json').read_text())
assert views['broad:all']['visits'] == 12016
assert sum(views[f'broad:2026-{m:02}']['visits'] for m in range(1, 10)) == 12016
print(f'Prepared {len(views)} aggregate views; full-period metrics verified.')
