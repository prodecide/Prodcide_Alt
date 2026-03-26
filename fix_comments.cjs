const fs = require('fs');
const files = ['Home.jsx', 'Discovery.jsx', 'Dashboard.jsx', 'Experts.jsx'];
for (const file of files) {
  const path = 'src/components/' + file;
  let text = fs.readFileSync(path, 'utf8');
  text = text.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');
  fs.writeFileSync(path, text);
}
console.log('Fixed HTML comments in JSX files.');
