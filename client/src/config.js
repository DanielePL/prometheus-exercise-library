// Configuration file for the application

// Check if we're running in Electron
const isElectron = () => {
  // Renderer process
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true;
  }
  
  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
    return true;
  }
  
  // Detect the user agent when the `nodeIntegration` option is set to false
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
    return true;
  }
  
  return false;
};

// Set API URL based on environment
const API_URL = isElectron() 
  ? 'http://localhost:3001/api' // Use localhost in Electron
  : process.env.REACT_APP_API_URL || 'http://localhost:3001/api'; // Use env variable or default in web app

export default {
  API_URL
}; 