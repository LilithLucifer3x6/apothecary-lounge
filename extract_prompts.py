import json

transcript_path = r"C:\Users\purpl\.gemini\antigravity\brain\0c01db80-c57e-4d3d-a041-67ad5aece128\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('tool_calls'):
                for tc in data['tool_calls']:
                    if tc.get('name') == 'default_api:generate_image':
                        args = tc.get('arguments', {})
                        img_name = args.get('ImageName', '')
                        if 'robe' in img_name.lower():
                            print(f"IMAGE: {img_name}")
                            print(f"PROMPT: {args.get('Prompt')}\n")
        except:
            pass
