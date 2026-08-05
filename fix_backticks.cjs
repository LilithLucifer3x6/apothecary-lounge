const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/screens/*.jsx');
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/text=`([^`]+)`/g, 'text={`$1`}');
  fs.writeFileSync(f, c);
}
console.log('Fixed backticks');
