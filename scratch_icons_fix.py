import re

with open('c:/Users/purpl/apothecary-lounge/custom-icons.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace svg string assignments with JSX
def replace_svg(match):
    key = match.group(1)
    svg = match.group(2)
    # Convert stroke-width to strokeWidth, etc
    svg = svg.replace('stroke-width', 'strokeWidth')
    svg = svg.replace('stroke-linecap', 'strokeLinecap')
    svg = svg.replace('stroke-linejoin', 'strokeLinejoin')
    svg = svg.replace('fill-opacity', 'fillOpacity')
    svg = svg.replace('class=', 'className=')
    return f" '{key}': ({svg}),"

content = re.sub(r"'([^']+)'\s*:\s*`(<svg.*?</svg>)`\s*,", replace_svg, content)

# Change export const CUSTOM = { to export const CUSTOM = {
content = content.replace("export const CUSTOM={", "import React from 'react';\n\nexport const CUSTOM={")
content = content.replace("export function ic", "export function ic")

with open('c:/Users/purpl/apothecary-lounge/custom-icons.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
