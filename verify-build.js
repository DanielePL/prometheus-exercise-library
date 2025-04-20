const fs = require('fs');
const path = require('path');

console.log('Current directory:', process.cwd());

// Check client directory
const clientPath = path.join(process.cwd(), 'client');
console.log('Client directory exists:', fs.existsSync(clientPath));

// Check client/build directory
const clientBuildPath = path.join(process.cwd(), 'client/build');
console.log('Client build directory exists:', fs.existsSync(clientBuildPath));

if (fs.existsSync(clientBuildPath)) {
  // List files in client/build
  console.log('Files in client/build:');
  fs.readdirSync(clientBuildPath).forEach(file => {
    console.log(' - ' + file);
  });
  
  // Check for index.html
  const indexPath = path.join(clientBuildPath, 'index.html');
  console.log('index.html exists:', fs.existsSync(indexPath));
} else {
  console.log('Client build directory does not exist');
}

// Check server directory
const serverPath = path.join(process.cwd(), 'server');
console.log('Server directory exists:', fs.existsSync(serverPath));

// Check server/src directory
const serverSrcPath = path.join(process.cwd(), 'server/src');
console.log('Server src directory exists:', fs.existsSync(serverSrcPath));

// Check node_modules
console.log('Root node_modules exists:', fs.existsSync(path.join(process.cwd(), 'node_modules')));
console.log('Client node_modules exists:', fs.existsSync(path.join(clientPath, 'node_modules')));
console.log('Server node_modules exists:', fs.existsSync(path.join(serverPath, 'node_modules'))); 