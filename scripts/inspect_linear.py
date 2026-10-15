import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from linear_ops import get_issues

issues = get_issues()
print(f"Total issues: {len(issues)}")
for i in sorted(issues, key=lambda x: x.get('identifier', '')):
    print(f"{i['identifier']}: {i['title']} [{i['state']['name']}] (ID: {i['id']})")
