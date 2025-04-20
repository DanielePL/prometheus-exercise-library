// crawlers/index.js
const wodwellCrawler = require('./sources/wodwell');
const logger = require('./utils/logger');

// Function to run all crawlers manually
async function runAllCrawlers() {
  logger.info('Running all crawlers...');
  try {
    // Crawl multiple pages of each workout type
    await wodwellCrawler.crawlCrossFitWorkouts(5); // 5 pages of CrossFit workouts
    await wodwellCrawler.crawlHyroxWorkouts(3);    // 3 pages of Hyrox workouts
    await wodwellCrawler.crawlCompetitiveWorkouts(2); // 2 pages of competitive workouts
    await wodwellCrawler.crawlStrengthWorkouts(2); // 2 pages of strength workouts

    logger.info('All crawlers completed successfully');
  } catch (error) {
    logger.error('Error running crawlers:', error);
  }
}

// Initial setup to crawl many historical workouts
async function runHistoricalCrawl() {
  logger.info('Starting historical workout crawl...');
  try {
    // Crawl many pages to get historical workouts
    await wodwellCrawler.crawlCrossFitWorkouts(20); // 20 pages = ~200 workouts
    await wodwellCrawler.crawlHyroxWorkouts(10);    // 10 pages
    await wodwellCrawler.crawlCompetitiveWorkouts(10);
    await wodwellCrawler.crawlStrengthWorkouts(10);

    logger.info('Historical crawl completed successfully');
  } catch (error) {
    logger.error('Error running historical crawl:', error);
  }
}

// If this file is run directly with a "historical" parameter, run the historical crawl
if (require.main === module) {
  if (process.argv.includes('--historical')) {
    runHistoricalCrawl();
  } else {
    runAllCrawlers();
  }
}

module.exports = {
  runAllCrawlers,
  runHistoricalCrawl
};