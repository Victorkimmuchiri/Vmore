import sys
import json

with open('src/data/pinterest_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"tag": "Pinterest"', '"tag": "Artisan Made"')

with open('src/data/pinterest_data.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Replaced tags successfully.')
