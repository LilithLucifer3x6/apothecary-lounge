import re

def fix_braces(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The issue is that we have an extra `}` before `});` for the invokeAnthropicProxy calls.
    # Typically it looks like:
    #       tools: tools
    #     }
    #   });
    # We want it to be:
    #       tools: tools
    #   });
    
    # We can match `}\n  });` and replace with `});`
    content = re.sub(r"    \}\n  \}\);", r"  });", content)
    content = re.sub(r"      \}\n    \}\);", r"    });", content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_braces('c:/Users/purpl/apothecary-lounge/src/lib/ai-engine.js')
fix_braces('c:/Users/purpl/apothecary-lounge/src/lib/ai-service.js')
