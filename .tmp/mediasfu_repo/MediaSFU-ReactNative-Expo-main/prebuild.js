// scripts/prebuild.js
const fs = require('fs');
const packageJson = require('./package.json');

// Set the main entry point to "dist/main.js" temporarily
packageJson.main = "dist/main.js";

//add the type field to package.json
packageJson.type = "module";

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2), 'utf-8');
console.log("Updated package.json main entry to dist/main.js for build");
