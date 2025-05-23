// OpenAI API Service for Exercise Search
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development - move to backend in production
});

// System prompt for exercise search
const EXERCISE_SEARCH_PROMPT = `You are an expert fitness AI assistant specializing in exercise recommendations. 
Your job is to analyze natural language queries about exercises and return structured search parameters.

Given a user's search query, extract and return a JSON object with the following structure:
{
  "intent": "exercise_search",
  "muscleGroups": ["chest", "back", "legs", "shoulders", "arms", "core", "full body"],
  "categories": ["strength", "bodyweight", "compound", "isolation", "explosive", "isometric", "cardio"],
  "difficulty": ["beginner", "intermediate", "advanced"],
  "equipment": ["none", "barbell", "dumbbell", "kettlebell", "machine", "cable", "resistance band"],
  "keywords": ["specific", "exercise", "names"],
  "searchTerms": ["processed", "search", "terms"],
  "confidence": 0.95
}

Rules:
1. Only include relevant fields that match the query
2. Use exact values from the arrays above
3. Include confidence score (0-1)
4. If query is unclear, include multiple options
5. Extract specific exercise names if mentioned
6. Consider synonyms (e.g., "pecs" = chest, "lats" = back)

Examples:
Query: "chest exercises for beginners"
Response: {"muscleGroups": ["chest"], "difficulty": ["beginner"], "confidence": 0.9}

Query: "bodyweight exercises at home"
Response: {"equipment": ["none"], "categories": ["bodyweight"], "keywords": ["home"], "confidence": 0.85}

Query: "compound movements with barbell"
Response: {"categories": ["compound"], "equipment": ["barbell"], "confidence": 0.9}`;

// Analyze search query with OpenAI
export const analyzeSearchQuery = async (query) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: EXERCISE_SEARCH_PROMPT
        },
        {
          role: "user",
          content: `Analyze this exercise search query: "${query}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const analysisText = response.choices[0].message.content;

    try {
      // Parse the JSON response
      const analysis = JSON.parse(analysisText);
      return {
        success: true,
        analysis,
        originalQuery: query
      };
    } catch (parseError) {
      console.warn('Failed to parse OpenAI response as JSON:', analysisText);
      return {
        success: false,
        error: 'Invalid response format',
        fallback: true
      };
    }

  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
};

// Process exercises using AI analysis
export const processExercisesWithAI = async (exercises, aiAnalysis) => {
  let results = [...exercises];
  let scores = {};

  // Initialize scores
  exercises.forEach(exercise => {
    scores[exercise.id] = 0;
  });

  const analysis = aiAnalysis.analysis;

  // Score based on muscle groups
  if (analysis.muscleGroups) {
    analysis.muscleGroups.forEach(targetMuscle => {
      exercises.forEach(exercise => {
        const exerciseMuscle = exercise.muscleGroup.toLowerCase();
        if (exerciseMuscle.includes(targetMuscle.toLowerCase()) ||
            targetMuscle.toLowerCase().includes(exerciseMuscle.split(' ')[0])) {
          scores[exercise.id] += 15 * (analysis.confidence || 0.5);
        }
      });
    });
  }

  // Score based on categories
  if (analysis.categories) {
    analysis.categories.forEach(targetCategory => {
      exercises.forEach(exercise => {
        if (exercise.category.toLowerCase().includes(targetCategory.toLowerCase())) {
          scores[exercise.id] += 12 * (analysis.confidence || 0.5);
        }
      });
    });
  }

  // Score based on difficulty
  if (analysis.difficulty) {
    analysis.difficulty.forEach(targetDifficulty => {
      exercises.forEach(exercise => {
        if (exercise.difficulty.toLowerCase() === targetDifficulty.toLowerCase()) {
          scores[exercise.id] += 10 * (analysis.confidence || 0.5);
        }
      });
    });
  }

  // Score based on equipment
  if (analysis.equipment) {
    analysis.equipment.forEach(targetEquipment => {
      exercises.forEach(exercise => {
        const exerciseEquipment = exercise.equipment.toLowerCase();
        if ((targetEquipment === 'none' && exerciseEquipment.includes('none')) ||
            exerciseEquipment.includes(targetEquipment.toLowerCase())) {
          scores[exercise.id] += 10 * (analysis.confidence || 0.5);
        }
      });
    });
  }

  return {
    results: exercises.filter(exercise => scores[exercise.id] > 0).sort((a, b) => scores[b.id] - scores[a.id]),
    scores,
    analysis,
    totalMatches: exercises.filter(exercise => scores[exercise.id] > 0).length
  };
};

// Fallback smart search without OpenAI
export const smartSearchFallback = (query, exercises) => {
  const patterns = {
    muscleGroups: {
      chest: ['chest', 'pecs', 'pectoral', 'bench'],
      back: ['back', 'lats', 'latissimus', 'row', 'pull'],
      legs: ['legs', 'quads', 'quadriceps', 'hamstrings', 'glutes', 'squat', 'lunge'],
      shoulders: ['shoulders', 'delts', 'deltoids', 'press'],
      arms: ['arms', 'biceps', 'triceps', 'curl'],
      core: ['core', 'abs', 'abdominals', 'plank']
    }
  };

  const queryLower = query.toLowerCase();
  let scores = {};

  exercises.forEach(exercise => {
    scores[exercise.id] = 0;

    // Basic text matching
    if (exercise.name.toLowerCase().includes(queryLower)) {
      scores[exercise.id] += 10;
    }
    if (exercise.description.toLowerCase().includes(queryLower)) {
      scores[exercise.id] += 5;
    }
  });

  return exercises
    .filter(exercise => scores[exercise.id] > 0)
    .sort((a, b) => scores[b.id] - scores[a.id]);
};

// Check if OpenAI is available
export const isOpenAIAvailable = () => {
  return !!process.env.REACT_APP_OPENAI_API_KEY;
};