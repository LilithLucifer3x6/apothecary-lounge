import re

with open('c:/Users/purpl/apothecary-lounge/src/styles/components.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    ".chip.on { border-color: var(--crimson); color: var(--crimson-b); background: rgba(90, 10, 16, 0.2); }",
    ".chip.on { border-color: var(--crimson); color: var(--crimson-b); background: rgba(0, 0, 0, 0.4); }"
)

content = content.replace(
    "background: var(--crimson-b);",
    "background: rgba(0, 0, 0, 0.4);"
)

# And .st.on
content = content.replace(
    ".st.on { background: var(--card); border-color: var(--gold); color: var(--gold); }",
    ".st.on { background: rgba(0, 0, 0, 0.4); border-color: var(--crimson-b); color: var(--crimson-b); }"
)

with open('c:/Users/purpl/apothecary-lounge/src/styles/components.css', 'w', encoding='utf-8') as f:
    f.write(content)
