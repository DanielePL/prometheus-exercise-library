// Configuration file for API endpoints and other settings

// Determine the base API URL based on environment
const getBaseUrl = () => {
  // For local development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  
  // For production, use relative URL to the same domain
  return '';
};

const API_URL = getBaseUrl();

// Create URL with proper app path in production
const getAppUrl = (path) => {
  if (process.env.NODE_ENV === 'production') {
    return `/app${path}`;
  }
  return path;
};

const CONFIG = {
  // API Endpoints
  API: {
    BASE_URL: API_URL,
    EXERCISES: `${API_URL}/api/exercises`,
    WORKOUTS: `${API_URL}/api/workouts`,
    GENERATE_WORKOUT: `${API_URL}/api/workouts/generate`,
    IMPORT_WORKOUT: `${API_URL}/api/workouts/import`,
    AUTH: {
      LOGIN: `${API_URL}/api/auth/login`,
      REGISTER: `${API_URL}/api/auth/register`,
      PROFILE: `${API_URL}/api/auth/profile`,
    }
  },
  
  // App URLs
  APP: {
    getPath: getAppUrl
  },
  
  // Other configuration settings
  DEFAULT_PAGINATION_LIMIT: 20,
  WORKOUT_TYPES: ['bodybuilding', 'powerlifting', 'crossfit', 'olympic_weightlifting', 'hyrox', 'hiit', 'calisthenics', 'yoga', 'general']
};

export default CONFIG; 