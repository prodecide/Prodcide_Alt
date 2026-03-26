const fs = require('fs');

let path = 'src/components/Form.jsx';
let text = fs.readFileSync(path, 'utf8');

// fix comments
text = text.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

// fix styles
text = text.replace(/style="font-variation-settings:\s*'FILL'\s*1;"/g, "style={{ fontVariationSettings: \"'FILL' 1\" }}");

// fix navbars
text = text.replace(/<a([^>]*?)href="#"([^>]*?)>Consultants<\/a>/g, '<Link$1to="/experts"$2>Consultants</Link>');
text = text.replace(/<a([^>]*?)href="#"([^>]*?)>My Projects<\/a>/g, '<Link$1to="/dashboard"$2>My Projects</Link>');
text = text.replace(/<span([^>]*?)>ProDecide<\/span>/g, '<Link$1 to="/">ProDecide</Link>');

// add React Router Link
if (!text.includes('import { Link }')) {
    text = text.replace("import React from 'react';", "import React from 'react';\nimport { Link } from 'react-router-dom';");
}

fs.writeFileSync(path, text);
console.log('Fixed Form.jsx');
