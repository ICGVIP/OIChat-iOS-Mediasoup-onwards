// scripts/postbuild.js
// const fs = require('fs');
// const packageJson = require('./package.json');

import fs from 'fs';
import packageJson from './package.json';

// Set main entry to "dist/main.js" after build
packageJson.main = "index.tsx";
//remove the type field from package.json
packageJson.type = "commonjs";


fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2), 'utf-8');

