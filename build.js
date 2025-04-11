const fs = require('fs');
const path = require('path');

// Read the config file
const configPath = path.join(__dirname, 'js', 'config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace the placeholders with the actual values from environment variables
if (process.env.SUPABASE_URL) {
  configContent = configContent.replace('YOUR_LOCAL_DEVELOPMENT_URL', process.env.SUPABASE_URL);
}

if (process.env.SUPABASE_KEY) {
  configContent = configContent.replace('YOUR_LOCAL_DEVELOPMENT_KEY', process.env.SUPABASE_KEY);
}

// Write the updated content back
fs.writeFileSync(configPath, configContent);

console.log('Environment variables injected successfully');