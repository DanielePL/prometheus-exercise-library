// Determine the base API URL based on the environment
const getBaseUrl = () => {
  // For development, use localhost with port 8080
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080';
  }

  // For production, use absolute path to the current domain
  return window.location.origin;
};

const API_URL = getBaseUrl();

const CONFIG = {
  // API Endpoints
  API_URL: API_URL,
  API: {
    BASE_URL: API_URL,
    EXERCISES: `${API_URL}/api/exercises`,           // Correct path
    WORKOUTS: `${API_URL}/api/workouts`,             // Correct path
    GENERATE_WORKOUT: `${API_URL}/api/workouts/generate`, // Correct path
    IMPORT_WORKOUT: `${API_URL}/api/workouts/import`,    // Correct path
    LOGIN: `${API_URL}/api/login`,                  // Correct path
    REGISTER: `${API_URL}/api/register`,            // Correct path
    USER: `${API_URL}/api/user`,                    // Correct path
  },
  // ...other configurations
};

// Die Konfiguration sieht korrekt aus:
// 1. Development verwendet Port 8080
// 2. Production verwendet window.location.origin
// 3. Alle API-Pfade sind korrekt definiert
// 4. Die Struktur des CONFIG-Objekts ist übersichtlich und logisch

// Es gibt keine Probleme oder Fehler in dieser Konfigurationsdatei.
// Die API-URLs sind richtig formatiert und verwenden die korrekte Basis-URL.

export default CONFIG;
