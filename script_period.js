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
const files = walk('client/src');
files.forEach(file => {
  if (file.includes('StatCard.jsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Clean up any old period injections just in case
  content = content.replace(/\bperiod=\{[^}]+\}/g, '');
  
  // Inject period
  let newContent = content.replace(/<StatCard /g, '<StatCard period={typeof period !== "undefined" ? period : "Month"} ');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Injected period:', file);
  }
});
