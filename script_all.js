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
    } else { 
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}
const files = walk('client/src/pages');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // First remove any existing autoScale props so we don't duplicate them
  content = content.replace(/<StatCard([^>]*?)\bautoScale\b([^>]*?)>/g, '<StatCard$1$2>');
  
  // Then inject autoScale into all StatCards
  let newContent = content.replace(/<StatCard /g, '<StatCard autoScale ');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Updated unconditionally', file);
  }
});
