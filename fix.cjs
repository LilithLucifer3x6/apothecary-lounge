const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Replace inline colors with --rose
  content = content.replace(/color:\s*'var\(--[^)]+\)'/g, "color: 'var(--rose)'");
  content = content.replace(/color:\s*'#[a-fA-F0-9]+'/g, "color: 'var(--rose)'");
  fs.writeFileSync(file, content);
});
console.log('Done');
