const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
      processDir(fullPath);
    } else if (entry.name.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      // Replace from 'path' with from 'path.js'
      // Replace from "path" with from "path.js"
      content = content.replace(
        /from\s+['"](\.\.?\/.*?)['"]/g,
        (match, p1) => {
          // Don't add .js if it already has it or if it's a bare import
          if (p1.endsWith('.js')) return match;
          return `from '${p1}.js'`;
        }
      );
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDir('src');
processDir('test');
console.log('Done reverting to .js extensions!');
