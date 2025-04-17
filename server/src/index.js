// server/index.js - Express server setup
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'fallback-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Could not connect to MongoDB Atlas:', err));

// Exercise Schema
const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: String,
  muscleTargets: [String],
  equipment: [String],
  loadType: String,
  executionMode: String,
  primaryPurpose: String,
  repetitionRange: String,
  setScheme: String,
  restTime: String,
  velocityTracking: Boolean,
  progressionType: String,
  timeUnderTension: String,
  barPathTracking: Boolean,
  accessoryPairing: String,
  conditioningComponent: Boolean,
  workoutDuration: String,
  tabataTimer: String,
  competitionStandard: Boolean,
  workoutTags: [String],
  videoDemo: String,
  notes: String,
  clientAdjustments: String,
  additionalFunction: String,
  distanceUnits: String,
  approved: { type: Boolean, default: false },
  description: String, // Added description field
  difficulty: String,  // Added difficulty field
  category: String,    // Added category field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

// File upload setup
const upload = multer({ storage: multer.memoryStorage() });

// API Routes
app.get('/api/exercises', async (req, res) => {
  try {
    const { muscleGroup, category, search } = req.query;

    let query = {};

    if (muscleGroup && muscleGroup !== 'All') {
      query.muscleTargets = muscleGroup;
    }

    if (category && category !== 'All') {
      query.workoutTags = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const exercises = await Exercise.find(query).sort({ name: 1 });
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/exercises', async (req, res) => {
  try {
    const exercise = new Exercise(req.body);
    await exercise.save();
    res.status(201).json(exercise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/exercises/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(exercise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete exercise endpoint
app.delete('/api/exercises/:id', async (req, res) => {
  try {
    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Excel import endpoint
app.post('/api/import', upload.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const exercises = [];
    const errors = [];

    for (const row of data) {
      try {
        const exercise = {
          name: row['Exercise Name'] || '',
          sport: row['Sport'] || '',
          muscleTargets: row['Muscle Target'] ? row['Muscle Target'].split(',').map(m => m.trim()) : [],
          equipment: row['Equipment'] ? row['Equipment'].split('/').map(e => e.trim()) : [],
          loadType: row['Load Type'] || '',
          executionMode: row['Execution Mode'] || '',
          primaryPurpose: row['Primary Purpose'] || '',
          repetitionRange: row['Repetition Range'] || '',
          setScheme: row['Set Scheme'] || '',
          restTime: row['Rest Time'] || '',
          velocityTracking: row['Velocity Tracking'] === 'X',
          barPathTracking: row['Bar Path Tracking'] === 'X',
          progressionType: row['Progression Type'] || '',
          timeUnderTension: row['Time Under Tension'] || '',
          accessoryPairing: row['Accessory Pairing'] || '',
          conditioningComponent: row['Conditioning Component'] === 'X',
          workoutDuration: row['Workout Duration'] || '',
          tabataTimer: row['Tabata Timer'] || '',
          competitionStandard: row['Competition Standard'] === 'X',
          workoutTags: row['Workout Tags'] ? row['Workout Tags'].split(',').map(t => t.trim()) : [],
          videoDemo: row['Video Demo'] || '',
          notes: row['Notes/Comments'] || '',
          clientAdjustments: row['Client-Specific Adjustments'] || '',
          additionalFunction: row['Additional Weight Function'] || '',
          distanceUnits: row['Distance/Units'] || '',
          approved: false
        };

        exercises.push(exercise);
      } catch (error) {
        errors.push({
          row: row['Exercise Name'],
          error: error.message
        });
      }
    }

    // Insert all valid exercises
    if (exercises.length > 0) {
      await Exercise.insertMany(exercises);
    }

    res.json({
      success: true,
      imported: exercises.length,
      errors: errors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Map similar terms to standardized muscle group names
const muscleGroupMappings = {
  "chest": "Pectoralis Major",
  "pecs": "Pectoralis Major",
  "pectorals": "Pectoralis Major",
  "pectoralis": "Pectoralis Major",

  "quads": "Quadriceps",
  "quadriceps": "Quadriceps",
  "thighs": "Quadriceps",

  "shoulders": "Deltoids",
  "delts": "Deltoids",
  "deltoids": "Deltoids",

  // Add more mappings as needed
};

// Helper function to standardize muscle group names
function standardizeMuscleGroups(muscleTargets) {
  if (!muscleTargets || !Array.isArray(muscleTargets)) return muscleTargets;

  return muscleTargets.map(muscle => {
    const lowercaseMuscle = muscle.toLowerCase();
    return muscleGroupMappings[lowercaseMuscle] || muscle;
  });
}

// Function to calculate string similarity
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  // Check if one is a substring of the other
  if (longer.includes(shorter)) return 0.9;

  // Simple approximation - can be improved
  const matchCount = [...shorter].filter(char => longer.includes(char)).length;
  return matchCount / longer.length;
}

// AI search endpoint with emphasis on variations and duplicate detection
app.post('/api/ai-search', async (req, res) => {
  try {
    const { searchTerm } = req.body;
    console.log(`Received search request for: "${searchTerm}"`);

    // First, get existing exercises from database with similar names
    const existingExercises = await Exercise.find({
      name: { $regex: searchTerm, $options: 'i' }
    }).select('name');

    const existingNames = existingExercises.map(ex => ex.name.toLowerCase());
    console.log("Existing exercise names:", existingNames);

    // Using the current chat completions API with improved prompt for variations
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a fitness expert specialized in exercise variations. Your task is to generate comprehensive lists of exercise variations, including common, uncommon, and specialized variations used by professional athletes and trainers. Include variations based on equipment, stance, grip, range of motion, tempo, and other technique modifications. Be thorough and specific."
        },
        {
          role: "user",
          content: `Generate a comprehensive list of at least 15 different variations of the "${searchTerm}" exercise, including standard forms, modified versions, equipment variations, and specialized techniques used by professional trainers. Return ONLY a JSON array with objects having these properties: name (string), description (string), muscleTargets (array of strings), equipment (string), category (string), difficulty (string).`
        }
      ],
      temperature: 0.7, // Slightly higher temperature for more creative variations
      max_tokens: 2000 // Increased token limit to allow for more detailed responses
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("Received response from OpenAI");

    // Extract the content from the response
    const content = response.data.choices[0].message.content;
    console.log("Raw content (first 200 chars):", content.substring(0, 200) + "...");

    // Try to parse the JSON
    let exercises;
    try {
      exercises = JSON.parse(content);

      // Ensure exercises is an array
      if (!Array.isArray(exercises)) {
        exercises = [exercises];
      }

      console.log(`Successfully parsed ${exercises.length} exercises`);
    } catch (err) {
      console.error("Failed to parse JSON:", err);

      // Try to extract JSON if content has extra text
      const jsonMatch = content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          exercises = JSON.parse(jsonMatch[0]);
          if (!Array.isArray(exercises)) {
            exercises = [exercises];
          }
          console.log(`Extracted JSON from text with ${exercises.length} exercises`);
        } catch (e) {
          console.error("Could not extract valid JSON either:", e);
          throw new Error("Could not extract valid JSON from response");
        }
      } else {
        throw new Error("Could not extract valid JSON from response");
      }
    }

    // Standardize muscle groups and mark potential duplicates
    exercises = exercises.map(exercise => {
      // Standardize muscle targets
      if (exercise.muscleTargets && Array.isArray(exercise.muscleTargets)) {
        exercise.muscleTargets = standardizeMuscleGroups(exercise.muscleTargets);
      }

      // Check if similar to existing exercises
      const isDuplicate = existingNames.some(existingName => {
        const similarity = calculateSimilarity(exercise.name.toLowerCase(), existingName);
        return similarity > 0.8; // 80% similarity threshold
      });

      return {
        ...exercise,
        possibleDuplicate: isDuplicate
      };
    });

    // Filter out exercises that already exist in the database
    const filteredExercises = exercises.filter(exercise => {
      // Check if this exercise name is similar to any existing exercise
      return !existingNames.some(existingName =>
        // Compare exercise names case-insensitively
        exercise.name.toLowerCase().includes(existingName) ||
        existingName.includes(exercise.name.toLowerCase())
      );
    });

    console.log(`Filtered out ${exercises.length - filteredExercises.length} existing exercises, returning ${filteredExercises.length} new variations`);

    // Return the filtered exercises
    return res.json({ success: true, exercises: filteredExercises });

  } catch (err) {
    console.error("Error in AI search:", err.message);
    if (err.response) {
      console.error("OpenAI API error details:", err.response.data);
    }

    // Fallback with mock data if the AI service fails
    const mockExercises = [
      {
        name: `${req.body.searchTerm} Variation 1`,
        description: "A standard variation of this exercise.",
        muscleTargets: ["Primary Muscle", "Secondary Muscle"],
        equipment: "Standard Equipment",
        category: "Strength",
        difficulty: "Intermediate"
      },
      {
        name: `${req.body.searchTerm} Variation 2`,
        description: "A modified version with different technique.",
        muscleTargets: ["Primary Muscle", "Accessory Muscle"],
        equipment: "Alternative Equipment",
        category: "Strength",
        difficulty: "Advanced"
      }
    ];

    console.log("Returning mock exercises as fallback");
    return res.json({ success: true, exercises: mockExercises });
  }
});

// Add endpoint to check for duplicates before adding
app.post('/api/check-duplicates', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Exercise name is required" });
    }

    // Find potential duplicates by name similarity
    const allExercises = await Exercise.find().select('name muscleTargets');

    const potentialDuplicates = allExercises.filter(ex => {
      const similarity = calculateSimilarity(ex.name.toLowerCase(), name.toLowerCase());
      return similarity > 0.7; // 70% similarity threshold
    });

    res.json({
      hasDuplicates: potentialDuplicates.length > 0,
      duplicates: potentialDuplicates
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
app.listen(5000, () => {
  console.log('Server running on port 5000');
});// test comment
=======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
>>>>>>> 3f715854ab149d29ff44c7be9a3cf19262c8cbc8
