const fs = require('fs');
const files = ['Home.jsx', 'Discovery.jsx', 'Dashboard.jsx', 'Experts.jsx'];

files.forEach(file => {
  const path = 'src/components/' + file;
  let content = fs.readFileSync(path, 'utf8');
  
  // Add import Link
  if (!content.includes("import { Link }")) {
    content = content.replace("import React from 'react';", "import React from 'react';\nimport { Link } from 'react-router-dom';");
  }
  
  // Change "Consultants" link
  content = content.replace(/<a([^>]*?)href="#"([^>]*?)>Consultants<\/a>/g, '<Link$1to="/experts"$2>Consultants</Link>');
  
  // Change "My Projects"
  content = content.replace(/<a([^>]*?)href="#"([^>]*?)>My Projects<\/a>/g, '<Link$1to="/dashboard"$2>My Projects</Link>');
  
  // Change "ProDecide" brand link
  content = content.replace(/<span([^>]*?)>ProDecide<\/span>/g, '<Link$1 to="/">ProDecide</Link>');

  // Change "Start Your Discovery" button to Link to /discovery
  if (file === 'Home.jsx') {
    content = content.replace(/<button([^>]*?)>\s*Start Your Discovery\s*<\/button>/g, '<Link$1 to="/discovery" style={{display: "inline-flex", alignItems: "center", justifyContent: "center"}}>Start Your Discovery</Link>');
  }

  fs.writeFileSync(path, content);
});
console.log("Done updating links in navbars");
