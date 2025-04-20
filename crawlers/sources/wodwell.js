// crawlers/sources/wodwell.js - updated with correct selectors
const axios = require('axios');
const logger = require('../utils/logger');
const parser = require('../utils/parser');
const { Workout, connectToDatabase } = require('../utils/database');

async function crawlWodwell(tag, source, categories, pages = 1) {
  try {
    await connectToDatabase();

    logger.info(`Crawling WODwell for ${tag} workouts...`);

    let allWorkouts = [];
    let savedCount = 0;
    let duplicateCount = 0;

    // Loop through pages
    for (let page = 1; page <= pages; page++) {
      logger.info(`Crawling page ${page} of ${pages} for ${tag}...`);

      const url = `https://wodwell.com/wods/tag/${tag}/?sort=newest&page=${page}`;
      const response = await axios.get(url);
      const $ = parser.parseHTML(response.data);

      // Updated selectors based on the screenshot
      const workoutElements = $('.wod-card, article');
      logger.info(`Found ${workoutElements.length} workouts on page ${page}`);

      if (workoutElements.length === 0) {
        logger.info(`No more workouts found on page ${page}. Stopping crawl.`);
        break;
      }

      // Process each workout found on this page
      for (let i = 0; i < workoutElements.length; i++) {
        const workoutElement = $(workoutElements[i]);

        // Updated selectors based on the screenshot
        const title = workoutElement.find('h2, h3').first().text().trim();
        const description = workoutElement.find('.wod-description, .entry-content').text().trim();

        // For time, AMRAP, etc.
        const wodType = workoutElement.find('.workout-type, .wod-type').text().trim();

        // Skip if no title or description
        if (!title || !description) {
          continue;
        }

        // Create date object
        const date = new Date();

        // Check if workout already exists
        const existingWorkout = await Workout.findOne({
          source: source,
          name: title
        });

        if (existingWorkout) {
          logger.info(`Workout "${title}" already exists. Skipping.`);
          duplicateCount++;
          continue;
        }

        // Parse exercises from description
        const exercises = parser.extractExercises(description);

        // Create and save the workout
        const workout = new Workout({
          name: title,
          source: source,
          date: date,
          type: wodType || parser.determineWorkoutType(description),
          description: description,
          exercises: exercises,
          categories: categories,
          difficulty: categories.includes('Hyrox') ? 'Advanced' : 'Intermediate'
        });

        await workout.save();
        logger.info(`Saved workout: ${title}`);
        savedCount++;
        allWorkouts.push(workout);
      }
    }

    logger.info(`Completed crawling ${tag}. Saved ${savedCount} new workouts. Found ${duplicateCount} duplicates.`);
    return allWorkouts;
  } catch (error) {
    logger.error(`Error crawling WODwell for ${tag}:`, error);
    throw error;
  }
}

// Specific functions for different workout types
async function crawlCrossFitWorkouts(pages = 1) {
  return crawlWodwell('crossfit-com', 'WODwell-CrossFit', ['CrossFit', 'WOD'], pages);
}

async function crawlHyroxWorkouts(pages = 1) {
  return crawlWodwell('hyrox-workouts', 'WODwell-Hyrox', ['Hyrox', 'Endurance'], pages);
}

async function crawlCompetitiveWorkouts(pages = 1) {
  return crawlWodwell('competitive', 'WODwell-Competitive', ['CrossFit', 'Competition'], pages);
}

async function crawlStrengthWorkouts(pages = 1) {
  return crawlWodwell('strength', 'WODwell-Strength', ['Strength', 'Weightlifting'], pages);
}

module.exports = {
  crawlWodwell,
  crawlCrossFitWorkouts,
  crawlHyroxWorkouts,
  crawlCompetitiveWorkouts,
  crawlStrengthWorkouts
};