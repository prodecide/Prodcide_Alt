const fs = require('fs');
const args = process.argv.slice(2);
const inputFile = args[0];
const outputFile = args[1];
const componentName = args[2];

try {
  const raw = fs.readFileSync(inputFile, 'utf8');

  // replace class= with className=
  let jsx = raw.replace(/class=/g, 'className=');
  // fix for attribute
  jsx = jsx.replace(/for=/g, 'htmlFor=');

  // Extract body contents
  const bodyMatch = jsx.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  let bodyContent = bodyMatch ? bodyMatch[1] : '';

  // Create Component JSX
  const compJsx = `import React from 'react';

export default function ${componentName}() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      ${bodyContent}
    </div>
  );
}
`;
  fs.writeFileSync(outputFile, compJsx);

  // Extract style contents and append to index.css
  const styleMatch = raw.match(/<style>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    const existingCss = fs.readFileSync('src/index.css', 'utf8');
    if (!existingCss.includes(styleMatch[1].trim().substring(0, 20))) {
        fs.appendFileSync('src/index.css', '\n' + styleMatch[1]);
    }
  }

  console.log("Parsing complete for " + componentName);
} catch (e) {
  console.error(e);
}
