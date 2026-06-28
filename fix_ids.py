import json
with open(r'C:\temp\sixiu-quiz\banks\jindaishi.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
qs = data.get('questions', data)
for i, q in enumerate(qs):
    q['id'] = str(i + 1)
with open(r'C:\temp\sixiu-quiz\banks\jindaishi.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False)
print('Done. Count:', len(qs), 'First IDs:', qs[0]['id'], qs[1]['id'], qs[2]['id'])
