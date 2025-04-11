const fs = require('fs');
const path = require('path');

// Read the config file
const configPath = path.join(__dirname, 'js', 'config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace the placeholder with the actual key from environment variable
configContent = configContent.replace('__SUPABASE_KEY__', process.env.SUPABASE_KEY);

// Write the updated content back
fs.writeFileSync(configPath, configContent);

console.log('Environment variables injected successfully');