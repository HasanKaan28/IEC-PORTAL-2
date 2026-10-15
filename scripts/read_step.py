import json

log_path = r'C:\Users\Kaan\.gemini\antigravity-ide\brain\646e6840-7b5d-4af0-a8c1-75aa8d6f4944\.system_generated\logs\transcript.jsonl'
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if '"step_index":523' in line:
            d = json.loads(line)
            print("FOUND STEP 523:")
            print(d.get('thinking', '')[:1000])
            break
