const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/screens/*.jsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace import
  content = content.replace(/import\s+\{\s*speakerMarkup\s*\}\s+from\s+['"]\.\.\/lib\/tts\.js['"];/g, "import SpeakerButton from '../components/SpeakerButton.jsx';");
  
  // Replace dangerouslySetInnerHTML with string literals (no styling inside span)
  // e.g. <span dangerouslySetInnerHTML={{ __html: speakerMarkup("The Altar") }} />
  content = content.replace(/<span\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*speakerMarkup\((['"`])(.*?)\1\)\s*\}\}\s*\/>/g, '<SpeakerButton text=$1$2$1 />');

  // with template literal vars e.g. speakerMarkup(`The ${displayedAltar}`)
  // `<SpeakerButton text={\`The ${displayedAltar}\`} />`
  content = content.replace(/<span\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*speakerMarkup\((`.*?`)\)\s*\}\}\s*\/>/g, '<SpeakerButton text={$1} />');
  
  // with variable e.g. speakerMarkup(displayName)
  content = content.replace(/<span\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*speakerMarkup\(([a-zA-Z0-9_]+)\)\s*\}\}\s*\/>/g, '<SpeakerButton text={$1} />');

  // Replace dangerouslySetInnerHTML WITH styles inside span
  // e.g. <span style={{ marginLeft: '0.4rem' }} dangerouslySetInnerHTML={{ __html: speakerMarkup(item.name) }} />
  content = content.replace(/<span\s+style=\{\{(.*?)\}\}\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*speakerMarkup\((['"`])(.*?)\2\)\s*\}\}\s*\/>/g, '<SpeakerButton text=$2$3$2 style={{$1}} />');
  
  content = content.replace(/<span\s+style=\{\{(.*?)\}\}\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*speakerMarkup\((`.*?`)\)\s*\}\}\s*\/>/g, '<SpeakerButton text={$2} style={{$1}} />');

  content = content.replace(/<span\s+style=\{\{(.*?)\}\}\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*speakerMarkup\(([a-zA-Z0-9_]+)\)\s*\}\}\s*\/>/g, '<SpeakerButton text={$2} style={{$1}} />');

  // what if style comes AFTER dangerouslySetInnerHTML
  content = content.replace(/<span\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*speakerMarkup\((['"`])(.*?)\1\)\s*\}\}\s+style=\{\{(.*?)\}\}\s*\/>/g, '<SpeakerButton text=$1$2$1 style={{$3}} />');
  
  content = content.replace(/<span\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*speakerMarkup\((`.*?`)\)\s*\}\}\s+style=\{\{(.*?)\}\}\s*\/>/g, '<SpeakerButton text={$1} style={{$2}} />');

  content = content.replace(/<span\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*speakerMarkup\(([a-zA-Z0-9_]+)\)\s*\}\}\s+style=\{\{(.*?)\}\}\s*\/>/g, '<SpeakerButton text={$1} style={{$2}} />');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Done');
