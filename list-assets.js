import fs from 'fs';
import path from 'path';

function listFiles(dir, prefix = '') {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    if (file === '.DS_Store') return;

    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      console.log(`${prefix}📁 ${file}`);
      listFiles(filePath, prefix + '  ');
    } else {
      console.log(`${prefix}📄 ${file}`);
    }
  });
}

// List assets in the tiny_swords_assets directory
console.log('Listing assets in tiny_swords_assets:');
listFiles('public/tiny_swords_assets');
