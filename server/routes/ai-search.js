const express = require('express');
const router = express.Router();
const Exercise = require('../models/exercise');

// Simple AI-like search functionality
// This could be enhanced with actual AI/ML services like OpenAI, etc.

// POST /ai-search - Intelligent search with natural language processing
router.post('/', async (req, res) => {
  try {
    const { searchTerm } = req.body;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const normalizedSearch = searchTerm.toLowerCase().trim();

    // Enhanced search logic with multiple strategies
    const searchResults = await performIntelligentSearch(normalizedSearch);

    res.json({
      success: true,
      searchTerm: searchTerm,
      results: searchResults,
      totalResults: searchResults.length,
      searchStrategies: getSearchStrategiesUsed(normalizedSearch)
    });

  } catch (error) {
    console.error('AI Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing AI search',
      error: error.message
    });
  }
});

// GET /ai-search/suggestions - Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const suggestions = await generateSearchSuggestions(query);

    res.json({
      success: true,
      suggestions: suggestions
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating search suggestions',
      error: error.message
    });
  }
});

// GET /ai-search/popular - Get popular search terms and exercises
router.get('/popular', async (req, res) => {
  try {
    const popularExercises = await Exercise.find({ approved: true })
      .sort({ usageCount: -1 })
      .limit(10)
      .select('name muscleGroup category usageCount');

    const popularTerms = await getPopularSearchTerms();

    res.json({
      success: true,
      popularExercises: popularExercises,
      popularTerms: popularTerms
    });

  } catch (error) {
    console.error('Popular search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular searches',
      error: error.message
    });
  }
});

// Enhanced search function with multiple strategies
async function performIntelligentSearch(searchTerm) {
  const strategies = [];
  let results = [];

  // Strategy 1: Exact name match
  const exactMatches = await Exercise.find({
    name: { $regex: searchTerm, $options: 'i' },
    approved: true
  }).limit(10);

  if (exactMatches.length > 0) {
    strategies.push('exact_name_match');
    results = results.concat(exactMatches);
  }

  // Strategy 2: Muscle group detection
  const muscleGroupMatches = await searchByMuscleGroup(searchTerm);
  if (muscleGroupMatches.length > 0) {
    strategies.push('muscle_group_match');
    results = results.concat(muscleGroupMatches);
  }

  // Strategy 3: Category detection
  const categoryMatches = await searchByCategory(searchTerm);
  if (categoryMatches.length > 0) {
    strategies.push('category_match');
    results = results.concat(categoryMatches);
  }

  // Strategy 4: Equipment detection
  const equipmentMatches = await searchByEquipment(searchTerm);
  if (equipmentMatches.length > 0) {
    strategies.push('equipment_match');
    results = results.concat(equipmentMatches);
  }

  // Strategy 5: Description and full-text search
  const textMatches = await Exercise.find({
    $text: { $search: searchTerm },
    approved: true
  }).sort({ score: { $meta: 'textScore' } }).limit(10);

  if (textMatches.length > 0) {
    strategies.push('full_text_search');
    results = results.concat(textMatches);
  }

  // Strategy 6: Semantic similarity (basic implementation)
  const semanticMatches = await semanticSearch(searchTerm);
  if (semanticMatches.length > 0) {
    strategies.push('semantic_search');
    results = results.concat(semanticMatches);
  }

  // Remove duplicates and sort by relevance
  const uniqueResults = removeDuplicatesAndScore(results, searchTerm);

  return uniqueResults.slice(0, 20); // Return top 20 results
}

// Search by muscle group
async function searchByMuscleGroup(searchTerm) {
  const muscleGroupKeywords = {
    'chest': ['Chest (Pectoralis)', 'Push (Chest/Shoulders/Triceps)'],
    'back': ['Back (Latissimus Dorsi)', 'Back (Rhomboids)', 'Pull (Back/Biceps)'],
    'shoulders': ['Shoulders (Deltoids)', 'Push (Chest/Shoulders/Triceps)'],
    'legs': ['Legs (Quads/Hamstrings/Glutes)', 'Quadriceps', 'Hamstrings', 'Glutes'],
    'arms': ['Biceps (Biceps Brachii)', 'Triceps (Triceps Brachii)', 'Arms'],
    'core': ['Core', 'Abdominals (Rectus Abdominis)', 'Obliques'],
    'glutes': ['Glutes', 'Legs (Quads/Hamstrings/Glutes)'],
    'quads': ['Quadriceps', 'Legs (Quads/Hamstrings/Glutes)'],
    'hamstrings': ['Hamstrings', 'Legs (Quads/Hamstrings/Glutes)'],
    'calves': ['Calves (Gastrocnemius)', 'Calves (Soleus)']
  };

  const matchedGroups = [];
  for (const [keyword, groups] of Object.entries(muscleGroupKeywords)) {
    if (searchTerm.includes(keyword)) {
      matchedGroups.push(...groups);
    }
  }

  if (matchedGroups.length === 0) return [];

  return await Exercise.find({
    muscleGroup: { $in: matchedGroups },
    approved: true
  }).limit(10);
}

// Search by category
async function searchByCategory(searchTerm) {
  const categoryKeywords = {
    'strength': ['Strength'],
    'cardio': ['Cardio', 'Endurance'],
    'bodyweight': ['Bodyweight'],
    'compound': ['Compound'],
    'isolation': ['Isolation'],
    'powerlifting': ['Powerlifting'],
    'crossfit': ['CrossFit'],
    'hiit': ['EMOM', 'AMRAP', 'Tabata'],
    'flexibility': ['Flexibility', 'Mobility'],
    'explosive': ['Explosive', 'Plyometric', 'Power']
  };

  const matchedCategories = [];
  for (const [keyword, categories] of Object.entries(categoryKeywords)) {
    if (searchTerm.includes(keyword)) {
      matchedCategories.push(...categories);
    }
  }

  if (matchedCategories.length === 0) return [];

  return await Exercise.find({
    category: { $in: matchedCategories },
    approved: true
  }).limit(10);
}

// Search by equipment
async function searchByEquipment(searchTerm) {
  const equipmentKeywords = {
    'barbell': ['Barbell'],
    'dumbbell': ['Dumbbell'],
    'kettlebell': ['Kettlebell'],
    'machine': ['Machine'],
    'cable': ['Cable'],
    'bodyweight': ['Bodyweight', 'None'],
    'resistance band': ['Resistance Band'],
    'trx': ['TRX/Suspension'],
    'medicine ball': ['Medicine Ball']
  };

  const matchedEquipment = [];
  for (const [keyword, equipment] of Object.entries(equipmentKeywords)) {
    if (searchTerm.includes(keyword)) {
      matchedEquipment.push(...equipment);
    }
  }

  if (matchedEquipment.length === 0) return [];

  return await Exercise.find({
    equipment: { $in: matchedEquipment },
    approved: true
  }).limit(10);
}

// Basic semantic search (can be enhanced with actual AI models)
async function semanticSearch(searchTerm) {
  const synonyms = {
    'push': ['bench press', 'shoulder press', 'push up'],
    'pull': ['pull up', 'row', 'lat pulldown'],
    'squat': ['squat', 'lunge', 'leg press'],
    'deadlift': ['deadlift', 'hip hinge', 'romanian deadlift'],
    'abs': ['plank', 'crunch', 'sit up', 'core'],
    'biceps': ['curl', 'bicep', 'arm'],
    'triceps': ['tricep', 'extension', 'dip']
  };

  const relatedTerms = [];
  for (const [key, terms] of Object.entries(synonyms)) {
    if (searchTerm.includes(key) || terms.some(term => searchTerm.includes(term))) {
      relatedTerms.push(...terms);
    }
  }

  if (relatedTerms.length === 0) return [];

  const regexPattern = relatedTerms.join('|');
  return await Exercise.find({
    $or: [
      { name: { $regex: regexPattern, $options: 'i' } },
      { description: { $regex: regexPattern, $options: 'i' } }
    ],
    approved: true
  }).limit(10);
}

// Remove duplicates and score results
function removeDuplicatesAndScore(results, searchTerm) {
  const uniqueMap = new Map();

  results.forEach(exercise => {
    const id = exercise._id.toString();
    if (!uniqueMap.has(id)) {
      // Calculate relevance score
      let score = 0;
      const lowerName = exercise.name.toLowerCase();
      const lowerDescription = exercise.description.toLowerCase();
      const lowerSearch = searchTerm.toLowerCase();

      // Exact name match gets highest score
      if (lowerName === lowerSearch) score += 100;
      else if (lowerName.includes(lowerSearch)) score += 50;

      // Description match
      if (lowerDescription.includes(lowerSearch)) score += 25;

      // Usage count bonus
      score += (exercise.usageCount || 0) * 0.1;

      uniqueMap.set(id, { ...exercise.toObject(), relevanceScore: score });
    }
  });

  return Array.from(uniqueMap.values())
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Generate search suggestions
async function generateSearchSuggestions(query) {
  const suggestions = [];

  // Exercise name suggestions
  const exerciseNames = await Exercise.find({
    name: { $regex: query, $options: 'i' },
    approved: true
  }).limit(5).select('name');

  exerciseNames.forEach(ex => suggestions.push({
    type: 'exercise',
    text: ex.name,
    category: 'Exercise Names'
  }));

  // Muscle group suggestions
  const muscleGroups = await Exercise.distinct('muscleGroup', {
    muscleGroup: { $regex: query, $options: 'i' },
    approved: true
  });

  muscleGroups.slice(0, 3).forEach(mg => suggestions.push({
    type: 'muscle_group',
    text: mg,
    category: 'Muscle Groups'
  }));

  // Category suggestions
  const categories = await Exercise.distinct('category', {
    category: { $regex: query, $options: 'i' },
    approved: true
  });

  categories.slice(0, 3).forEach(cat => suggestions.push({
    type: 'category',
    text: cat,
    category: 'Categories'
  }));

  return suggestions;
}

// Get popular search terms (placeholder - could be enhanced with actual tracking)
async function getPopularSearchTerms() {
  return [
    'chest workout',
    'leg exercises',
    'back training',
    'arm exercises',
    'core strengthening',
    'compound movements',
    'bodyweight exercises',
    'powerlifting',
    'crossfit wod',
    'mobility work'
  ];
}

// Get search strategies used
function getSearchStrategiesUsed(searchTerm) {
  const strategies = [];

  // Check what strategies would be triggered
  if (searchTerm.match(/chest|back|legs|arms|shoulders|core/i)) {
    strategies.push('muscle_group_detection');
  }

  if (searchTerm.match(/strength|cardio|bodyweight|compound|crossfit/i)) {
    strategies.push('category_detection');
  }

  if (searchTerm.match(/barbell|dumbbell|machine|cable|kettlebell/i)) {
    strategies.push('equipment_detection');
  }

  strategies.push('semantic_analysis');
  strategies.push('full_text_search');

  return strategies;
}

module.exports = router;