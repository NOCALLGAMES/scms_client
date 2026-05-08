const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/USER/Desktop/mine/scms/scms-client/src';

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('FaNairaSign') && content.includes('react-icons/fi')) {
          // Check if FaNairaSign is inside the Fi import
          const fiImportMatch = content.match(/import {([^}]*)} from ["']react-icons\/fi["']/);
          if (fiImportMatch && fiImportMatch[1].includes('FaNairaSign')) {
              console.log(filePath);
          }
      }
    }
  });
}

walk(rootDir);
