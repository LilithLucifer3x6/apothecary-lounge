const https = require('https');
https.get('https://replicate.com/lucataco', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    const matches = data.match(/lucataco\/dreamshaper[^\"\'\\]*/g) || [];
    console.log(Array.from(new Set(matches)).join('\n'));
  });
});
