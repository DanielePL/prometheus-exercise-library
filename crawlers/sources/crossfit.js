// Update crawlers/sources/crossfit.js
const axios = require('axios');
const logger = require('../utils/logger');
const parser = require('../utils/parser');
const { Workout, connectToDatabase } = require('../utils/database');

async function scrapeLatestWOD() {
  try {
    // Make sure we're connected to the database
    await connectToDatabase();

    logger.info('Scraping CrossFit WOD from WODwell...');
    const response = await axios.get('https://wodwell.com/wods/tag/crossfit-com/?sort=newest');
    const $ = parser.parseHTML(response.data);

    // Updated selectors for WODwell
    const workouts = $('.wod-card');
    logger.info(`Found ${workouts.length} CrossFit workouts on the page`);

    if (workouts.length === 0) {
      logger.info('No CrossFit workouts found on the page');
      return;
    }

    // Process the most recent workout
    const latestWorkout = $(workouts[0]);

    // Extract data using WODwell's structure
    const title = latestWorkout.find('.wod-card-title').text().trim();
    const description = latestWorkout.find('.wod-description').text().trim();
    const dateText = latestWorkout.find('.wod-date').text().trim();

    // Skip if no description found
    if (!description) {
      logger.info('No workout description found');
      return;
    }

    // Create date object from text or use current date
    const date = dateText ? new Date(dateText) : new Date();

    // Check if workout already exists for this date/title
    const existingWorkout = await Workout.findOne({
      source: 'WODwell-CrossFit',
      name: title
    });

    if (existingWorkout) {
      logger.info(`CrossFit workout "${title}" already exists`);
      return;
    }

    // Parse exercises from description
    const exercises = parser.extractExercises(description);

    // Determine workout type
    const type = parser.determineWorkoutType(description);

    // Create and save the workout
    const workout = new Workout({
      name: title,
      source: 'WODwell-CrossFit',
      date: date,
      type: type,
      description: description,
      exercises: exercises,
      categories: ['CrossFit', 'WOD'],
      difficulty: 'Intermediate'
    });

    await workout.save();
    logger.info(`Saved CrossFit workout: ${title}`);
    return workout;

  } catch (error) {
    logger.error('Error scraping CrossFit WOD:', error);
    throw error;
  }
}

module.exports = {
  scrapeLatestWOD
};