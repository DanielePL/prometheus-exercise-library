// crawlers/scheduler.js
const cron = require('node-cron');
const wodwellCrawler = require('./sources/wodwell');
const logger = require('./utils/logger');

// Initialize all scheduled tasks
function initScheduler() {
  // Run CrossFit crawler daily at 6 AM (crawl just one page for recent workouts)
  cron.schedule('0 6 * * *', async () => {
    logger.info('Running scheduled CrossFit workout crawler...');
    try {
      await wodwellCrawler.crawlCrossFitWorkouts(1);
      logger.info('Scheduled CrossFit crawler completed');
    } catch (error) {
      logger.error('Error in scheduled CrossFit crawler:', error);
    }
  });

  // Run Hyrox crawler weekly on Mondays at 7 AM
  cron.schedule('0 7 * * 1', async () => {
    logger.info('Running scheduled Hyrox workout crawler...');
    try {
      await wodwellCrawler.crawlHyroxWorkouts(1);
      logger.info('Scheduled Hyrox crawler completed');
    } catch (error) {
      logger.error('Error in scheduled Hyrox crawler:', error);
    }
  });

  // Run other workout type crawlers on different days
  cron.schedule('0 7 * * 3', async () => { // Wednesdays
    logger.info('Running scheduled Competitive workout crawler...');
    try {
      await wodwellCrawler.crawlCompetitiveWorkouts(1);
      logger.info('Scheduled Competitive crawler completed');
    } catch (error) {
      logger.error('Error in scheduled Competitive crawler:', error);
    }
  });

  cron.schedule('0 7 * * 5', async () => { // Fridays
    logger.info('Running scheduled Strength workout crawler...');
    try {
      await wodwellCrawler.crawlStrengthWorkouts(1);
      logger.info('Scheduled Strength crawler completed');
    } catch (error) {
      logger.error('Error in scheduled Strength crawler:', error);
    }
  });

  logger.info('Crawler scheduler initialized');
  logger.info('- CrossFit workouts: daily at 6 AM');
  logger.info('- Hyrox workouts: Mondays at 7 AM');
  logger.info('- Competitive workouts: Wednesdays at 7 AM');
  logger.info('- Strength workouts: Fridays at 7 AM');
}

// If this file is run directly, start the scheduler
if (require.main === module) {
  initScheduler();
}

module.exports = {
  initScheduler
};