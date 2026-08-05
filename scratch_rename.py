import os
import glob

files = glob.glob('c:/Users/purpl/apothecary-lounge/src/**/*.js*', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace('icons.js', 'icons.jsx')
    new_content = new_content.replace('custom-icons.js', 'custom-icons.jsx')
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
