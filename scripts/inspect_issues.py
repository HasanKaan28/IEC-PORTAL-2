#!/usr/bin/env python3
import json
from linear_ops import get_issues

issues = get_issues()
print(f"Total Issues: {len(issues)}")
for iss in sorted(issues, key=lambda x: int(x['identifier'].split('-')[1]) if '-' in x['identifier'] else 0):
    ident = iss['identifier']
    state = iss.get('state', {}).get('name')
    assignee = iss.get('assignee', {}).get('name') or "Unassigned"
    title = iss['title']
    print(f"[{ident}] [{state}] [{assignee}] {title}")

