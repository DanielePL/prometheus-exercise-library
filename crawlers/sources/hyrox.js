// Update crawlers/sources/hyrox.js
const axios = require('axios');
const logger = require('../utils/logger');
const parser = require('../utils/parser');
const { Workout, connectToDatabase } = require('../utils/database');

async function scrapeHyroxWorkouts() {
  try {
    // Make sure we're connected to the database
    await connectToDatabase();

    logger.info('Scraping Hyrox workouts from WODwell...');

    // Updated URL to WODwell's Hyrox workouts page
    const response = await axios.get('https://wodwell.com/wods/tag/hyrox-workouts/?sort=newest');
    const $ = parser.parseHTML(response.data);

    // Updated selectors for WODwell
    const workoutElements = $('.wod-card');
    logger.info(`Found ${workoutElements.length} Hyrox workouts on the page`);

    if (workoutElements.length === 0) {
      logger.info('No Hyrox workouts found on the page');
      return [];
    }

    const savedWorkouts = [];

    // Process each workout found
    for (let i = 0; i < workoutElements.length; i++) {
      const workoutElement = $(workoutElements[i]);

      // Extract data using WODwell's structure
      const title = workoutElement.find('.wod-card-title').text().trim();
      const description = workoutElement.find('.wod-description').text().trim();
      const dateText = workoutElement.find('.wod-date').text().trim();

      // Skip if no title or description
      if (!title || !description) {
        continue;
      }

      // Create date object from text or use current date
      const date = dateText ? new Date(dateText) : new Date();

      // Check if workout already exists
      const existingWorkout = await Workout.findOne({
        source: 'WODwell-Hyrox',
        name: title
      });

      if (existingWorkout) {
        logger.info(`Hyrox workout "${title}" already exists`);
        continue;
      }

      // Parse exercises from description
      const exercises = parser.extractExercises(description);

      // Create and save the workout
      const workout = new Workout({
        name: title,
        source: 'WODwell-Hyrox',
        date: date,
        type: parser.determineWorkoutType(description) || 'Hyrox',
        description: description,
        exercises: exercises,
        categories: ['Hyrox', 'Endurance'],
        difficulty: 'Advanced'
      });

      await workout.save();
      logger.info(`Saved Hyrox workout: ${title}`);
      savedWorkouts.push(workout);
    }

    return savedWorkouts;
  } catch (error) {
    logger.error('Error scraping Hyrox workouts:', error);
    throw error;
  }
}

module.exports = {
  scrapeHyroxWorkouts
};