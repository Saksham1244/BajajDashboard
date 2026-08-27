const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) { results = results.concat(walk(file)); }
    else if (file.endsWith('.jsx')) { results.push(file); }
  });
  return results;
}
walk('client/src').forEach(f => {
  if (f.includes('Performance.jsx') || f.includes('ConveyorReport.jsx') || f.includes('PQCAReport.jsx')) return; 
  // PQCAReport has total/ok/nc which SHOULD scale. Conveyor has avg speed which SHOULD NOT scale.
  
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(/(\|\|\s*\{\s*)([\s\S]*?)(\s*\})/g, (match, p1, p2, p3) => {
    // Replace unquoted integers with quoted integers inside the block
    const updatedProps = p2.replace(/([a-zA-Z0-9_]+)\s*:\s*(\d+)(,|\s*$)/g, '$1: "$2"$3');
    return p1 + updatedProps + p3;
  });
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log('Quoted integers in:', f);
  }
});
