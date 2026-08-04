const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.html')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Users/purpl/OneDrive/Desktop/witchy-app');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Remove ALL font-family declarations in CSS completely
  content = content.replace(/font-family\s*:\s*[^;}]+[;}]/gi, function(match) {
    // If it's the global var(--ff) or inherit, keep it. Otherwise, nuke it.
    if (match.includes('var(--ff)') || match.includes('inherit')) {
      return match;
    }
    // Return just the closing brace if it was captured
    return match.endsWith('}') ? '}' : '';
  });

  // Remove ALL fontFamily React inline styles completely
  // Handle double and single quotes
  content = content.replace(/fontFamily\s*:\s*(['"])[^'"]+\1\s*(,)?\s*/gi, '');
  content = content.replace(/fontFamily\s*:\s*`[^`]+`\s*(,)?\s*/gi, '');
  
  // Specific catch for the double/single quote mess: content = content.replace(/fontFamily\s*:\s*['"]'?[^'"]+'?,\s*[^'"]+['"]\s*(,)?\s*/gi, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Cleaned:', file);
    modifiedCount++;
  }
});

console.log('Modified files:', modifiedCount);
