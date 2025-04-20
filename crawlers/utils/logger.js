// Simple logger utility
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const infoLogPath = path.join(logsDir, 'info.log');

function timestamp() {
  return new Date().toISOString();
}

function logToFile(filePath, message) {
  const logEntry = `[${timestamp()}] ${message}\n`;
  fs.appendFileSync(filePath, logEntry);
}

function info(message) {
  const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;
  console.log(`[INFO] ${formattedMessage}`);
  logToFile(infoLogPath, `INFO: ${formattedMessage}`);
}

function error(message, err) {
  const errorDetails = err ? `\n${err.stack || err}` : '';
  const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;
  console.error(`[ERROR] ${formattedMessage}${errorDetails}`);
  logToFile(errorLogPath, `ERROR: ${formattedMessage}${errorDetails}`);
}

module.exports = {
  info,
  error
};