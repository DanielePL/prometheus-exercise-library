// crawlers/utils/parser.js
const cheerio = require('cheerio');

/**
 * Parses HTML content using Cheerio
 * @param {string} html HTML content to parse
 * @returns {cheerio.Root} Cheerio object for querying
 */
function parseHTML(html) {
  return cheerio.load(html);
}

/**
 * Extracts exercises from workout description text
 * @param {string} description Workout description text
 * @returns {Array} Array of exercise objects
 */
function extractExercises(description) {
  const exercises = [];

  // Split by line breaks
  const lines = description.split(/\r?\n/).filter(line => line.trim().length > 0);

  for (const line of lines) {
    // Try to match patterns like "15 pull-ups", "20 wall balls (20/14 lb)"
    const match = line.match(/(\d+)\s+([a-zA-Z\s\-\(\)\/\d]+)/);
    if (match) {
      exercises.push({
        name: match[2].trim(),
        reps: parseInt(match[1]),
        raw: line.trim()
      });
    } else if (line.toLowerCase().includes('meter') ||
               line.toLowerCase().includes('calories') ||
               line.toLowerCase().includes('run') ||
               line.toLowerCase().includes('row')) {
      // Handle cardio exercises that might not have the same pattern
      exercises.push({
        name: line.trim(),
        reps: null,
        raw: line.trim(),
        type: 'cardio'
      });
    }
  }

  return exercises;
}

/**
 * Determines the workout type from description
 * @param {string} description Workout description text
 * @returns {string} Workout type
 */
function determineWorkoutType(description) {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('amrap')) return 'AMRAP';
  if (lowerDesc.includes('for time')) return 'For Time';
  if (lowerDesc.includes('emom')) return 'EMOM';
  if (lowerDesc.includes('tabata')) return 'Tabata';
  if (lowerDesc.includes('rounds for time')) return 'For Time';
  if (lowerDesc.includes('complete')) return 'For Time';
  return 'Other';
}

module.exports = {
  parseHTML,
  extractExercises,
  determineWorkoutType
};