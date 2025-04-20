// server/index.js - Express server setup
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prometheus-exercises', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 60000
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.error('Stack:', err.stack);
  // Log the URI without credentials
  console.error('URI used (credentials hidden):',
    process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/.*?@/, '//***@') : 'undefined');
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

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
  description: String,
  difficulty: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Workout Schema
const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String, // AMRAP, For Time, EMOM, etc.
  description: String,
  exercises: Array, // Array of exercises with reps, weights, etc.
  source: { type: String, default: 'AI Generated' },
  category: { type: String, required: true }, // CrossFit, Hyrox, Bodybuilding, etc.
  difficulty: String,
  estimatedTime: String,
  scalingOptions: Array, // Scaling options for different fitness levels
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);
const Workout = mongoose.model('Workout', workoutSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'prometheus-secret-key';

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// Admin Middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

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

app.get('/api/test-db', async (req, res) => {
  try {
    // Test database connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    return res.json({
      success: true,
      message: 'Database connected',
      collections: collections.map(c => c.name)
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: err.message
    });
  }
});

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Add a debug info endpoint to see environment values
app.get('/api/debug-info', (req, res) => {
  res.status(200).json({
    environment: process.env.NODE_ENV,
    dirname: __dirname,
    clientBuildPath: path.join(__dirname, '../../client/build'),
    clientBuildExists: fs.existsSync(path.join(__dirname, '../../client/build')),
    clientIndexExists: fs.existsSync(path.join(__dirname, '../../client/build/index.html'))
  });
});

// Root route - change to redirect to frontend in production
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    console.log('Redirecting to React app from root endpoint');
    res.redirect('/app');
  } else {
    res.send('Prometheus Exercise Library API is running');
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

// New endpoint for workout generation
app.post('/api/generate-workouts', async (req, res) => {
  try {
    const { category, count = 3 } = req.body;
    console.log(`Generating ${count} workouts for category: ${category}`);

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    // Basic prompt for workout generation
    const prompt = `Generate ${count} complete ${category} workouts with unique names, detailed exercise descriptions, sets, reps, and scaling options. Return ONLY a JSON array where each workout has: name, type, description, exercises (array), difficulty, estimatedTime, and scalingOptions.`;

    // Call OpenAI API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a fitness expert specializing in creating ${category} workouts.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract and parse the content
    const content = response.data.choices[0].message.content;

    let workouts;
    try {
      workouts = JSON.parse(content);
      if (!Array.isArray(workouts)) {
        workouts = [workouts];
      }
    } catch (err) {
      const jsonMatch = content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        workouts = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(workouts)) {
          workouts = [workouts];
        }
      } else {
        throw new Error("Could not extract valid JSON from response");
      }
    }

    // Add category to each workout
    const processedWorkouts = workouts.map(workout => ({
      ...workout,
      category: category,
      source: 'AI Generated'
    }));

    // Save to database if requested
    if (req.body.save) {
      for (const workoutData of processedWorkouts) {
        const existingWorkout = await Workout.findOne({ name: workoutData.name });
        if (!existingWorkout) {
          const workout = new Workout(workoutData);
          await workout.save();
        }
      }
    }

    return res.json({ success: true, workouts: processedWorkouts });

  } catch (err) {
    console.error("Error generating workouts:", err.message);

    // Fallback
    const mockWorkouts = [
      {
        name: `Sample ${req.body.category} Workout`,
        type: "For Time",
        description: "Complete the following exercises as quickly as possible with good form.",
        exercises: [
          { name: "Push-Ups", reps: 20 },
          { name: "Air Squats", reps: 30 },
          { name: "Sit-Ups", reps: 40 }
        ],
        difficulty: "Intermediate",
        estimatedTime: "15-20 minutes",
        scalingOptions: [
          { level: "Beginner", modifications: "Reduce reps by half" },
          { level: "Advanced", modifications: "Add weight vest" }
        ]
      }
    ];

    return res.json({ success: true, workouts: mockWorkouts });
  }
});

// Get workouts endpoint
app.get('/api/workouts', async (req, res) => {
  try {
    const { category } = req.query;

    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }

    const workouts = await Workout.find(query).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI workout search endpoint
app.post('/api/ai-workout-search', async (req, res) => {
  try {
    const { searchTerm, workoutType } = req.body;
    console.log(`Received workout search request for: "${searchTerm}", type: ${workoutType}`);

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing in environment variables");
      throw new Error("OpenAI API key is not configured");
    }

    console.log("OpenAI API key exists:", process.env.OPENAI_API_KEY ? "Yes" : "No");

    // First, check if we already have workouts for this search
    let existingWorkouts = [];
    if (searchTerm) {
      existingWorkouts = await Workout.find({
        $and: [
          { category: new RegExp(workoutType, 'i') },
          {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
              { description: { $regex: searchTerm, $options: 'i' } }
            ]
          }
        ]
      }).limit(3);
    }

    console.log(`Found ${existingWorkouts.length} existing workouts in the database`);

    // If we have enough existing workouts, return them
    if (existingWorkouts.length >= 3) {
      console.log("Returning existing workouts from database");
      return res.json({ success: true, workouts: existingWorkouts });
    }

    // Construct appropriate prompt based on workout type
    let prompt = '';
    if (workoutType === 'crossfit') {
      prompt = `Generate ${3 - existingWorkouts.length} detailed CrossFit WODs related to "${searchTerm}". Include workout name, type (AMRAP, For Time, etc.), complete exercise list with reps, weights, and scaling options.`;
    } else if (workoutType === 'strength') {
      prompt = `Generate ${3 - existingWorkouts.length} detailed strength training workouts related to "${searchTerm}". Include workout name, structure, exercises, sets, reps, rest periods, and progression scheme.`;
    } else if (workoutType === 'hiit') {
      prompt = `Generate ${3 - existingWorkouts.length} detailed HIIT workouts related to "${searchTerm}". Include workout name, intervals, exercises, work/rest ratios, and progression options.`;
    } else if (workoutType === 'bodybuilding') {
      prompt = `Generate ${3 - existingWorkouts.length} detailed bodybuilding workouts related to "${searchTerm}". Include workout name, muscle focus, exercises, sets, reps, tempo, and rest periods.`;
    } else if (workoutType === 'endurance') {
      prompt = `Generate ${3 - existingWorkouts.length} detailed endurance workouts related to "${searchTerm}". Include workout name, duration, exercises, and intensity levels.`;
    } else if (workoutType === 'functional') {
      prompt = `Generate ${3 - existingWorkouts.length} detailed functional training workouts related to "${searchTerm}". Include workout name, movement patterns, exercise sequence, and scaling options.`;
    } else {
      prompt = `Generate ${3 - existingWorkouts.length} detailed ${workoutType} workouts related to "${searchTerm}". Include all necessary details for a complete workout.`;
    }

    // This format instruction is important for getting a parseable response
    prompt += ' Return a JSON object in the format {"workouts": [...]} where each workout contains: name, type, description, exercises (array of objects with name, sets, reps), difficulty, duration, and scalingOptions (array of scaling options for different fitness levels).';

    console.log("Sending prompt to OpenAI:", prompt);

    // Call OpenAI API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a fitness expert specializing in workout programming. Always respond with valid JSON that contains a 'workouts' array."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("Received response from OpenAI");

    // Parse response and return workouts
    const content = response.data.choices[0].message.content;
    console.log("Raw OpenAI response:", content.substring(0, 200) + "...");
    
    let workouts = [];

    try {
      // Parse the JSON content
      const parsed = JSON.parse(content);
      console.log("Successfully parsed JSON response");
      
      // Extract the workouts array from the parsed JSON
      if (parsed.workouts && Array.isArray(parsed.workouts)) {
        workouts = parsed.workouts;
        console.log(`Extracted ${workouts.length} workouts from response`);
      } else if (Array.isArray(parsed)) {
        // Sometimes the API might return a direct array
        workouts = parsed;
        console.log(`Got array directly with ${workouts.length} workouts`);
      } else if (typeof parsed === 'object') {
        // If it's just a single workout object
        workouts = [parsed];
        console.log("Got a single workout object");
      } else {
        console.error("Unexpected response format:", typeof parsed);
        throw new Error("Unexpected response format from API");
      }
    } catch (err) {
      console.error("JSON parsing error:", err);
      console.log("Raw content:", content);
      
      try {
        // Try to extract any JSON-like structure as a fallback
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0];
          console.log("Extracted JSON structure:", extractedJson.substring(0, 100) + "...");
          
          const parsed = JSON.parse(extractedJson);
          if (parsed.workouts && Array.isArray(parsed.workouts)) {
            workouts = parsed.workouts;
          } else {
            workouts = [parsed];
          }
          console.log(`Recovered ${workouts.length} workouts from extracted JSON`);
        } else {
          console.error("Could not extract valid JSON structure");
          throw new Error("Could not extract valid JSON from response");
        }
      } catch (extractionErr) {
        console.error("JSON extraction error:", extractionErr);
        throw new Error("Failed to parse AI response");
      }
    }

    if (workouts.length === 0) {
      console.error("No workouts were extracted from the response");
      throw new Error("No workouts were found in the API response");
    }

    // Add category to each workout
    const processedWorkouts = workouts.map(workout => ({
      ...workout,
      category: workoutType.charAt(0).toUpperCase() + workoutType.slice(1),
      source: 'AI Generated'
    }));

    // Combine existing and new workouts
    const combinedWorkouts = [...existingWorkouts, ...processedWorkouts];
    console.log(`Returning ${combinedWorkouts.length} total workouts (${existingWorkouts.length} existing + ${processedWorkouts.length} new)`);

    return res.json({ success: true, workouts: combinedWorkouts });
  } catch (err) {
    console.error("Error in AI workout search:", err.message);
    console.error("Error stack:", err.stack);

    // Fallback with more detailed workouts
    const mockWorkouts = [
      {
        name: `${req.body.workoutType.charAt(0).toUpperCase() + req.body.workoutType.slice(1)} Circuit Challenge`,
        type: req.body.workoutType === 'crossfit' ? "For Time" : "Circuit",
        description: `Complete 3 rounds of this ${req.body.workoutType} workout focusing on intensity and form.`,
        exercises: [
          { name: "Push-Ups", sets: 3, reps: 15 },
          { name: "Kettlebell Swings", sets: 3, reps: 20 },
          { name: "Box Jumps", sets: 3, reps: 12 },
          { name: "Plank", sets: 3, reps: "30 seconds" }
        ],
        difficulty: "Intermediate",
        duration: "20-25 minutes",
        scalingOptions: [
          { level: "Beginner", modifications: "Reduce rounds to 2, decrease reps by 30%" },
          { level: "Advanced", modifications: "Add weight vest, increase rounds to 4" }
        ],
        category: req.body.workoutType.charAt(0).toUpperCase() + req.body.workoutType.slice(1),
        source: 'AI Generated (Fallback)'
      },
      {
        name: `${req.body.searchTerm || 'Total Body'} ${req.body.workoutType.charAt(0).toUpperCase() + req.body.workoutType.slice(1)} Blast`,
        type: req.body.workoutType === 'crossfit' ? "AMRAP" : "Superset",
        description: `As many rounds as possible in 15 minutes of this challenging ${req.body.workoutType} workout.`,
        exercises: [
          { name: "Burpees", sets: "AMRAP", reps: 10 },
          { name: "Dumbbell Thrusters", sets: "AMRAP", reps: 12 },
          { name: "Pull-Ups", sets: "AMRAP", reps: 8 },
          { name: "Russian Twists", sets: "AMRAP", reps: 20 }
        ],
        difficulty: "Intermediate-Advanced",
        duration: "15 minutes",
        scalingOptions: [
          { level: "Beginner", modifications: "Assisted pull-ups, knee push-ups" },
          { level: "Advanced", modifications: "Weighted pull-ups, handstand push-ups" }
        ],
        category: req.body.workoutType.charAt(0).toUpperCase() + req.body.workoutType.slice(1),
        source: 'AI Generated (Fallback)'
      }
    ];

    console.log("Returning fallback workouts due to error");
    return res.json({
      success: false,
      error: err.message,
      workouts: mockWorkouts
    });
  }
});

// Save workout endpoint
app.post('/api/workouts', async (req, res) => {
  try {
    // Check if workout already exists
    const existingWorkout = await Workout.findOne({ name: req.body.name });

    if (existingWorkout) {
      return res.status(400).json({
        success: false,
        error: "A workout with this name already exists"
      });
    }

    // Create and save the new workout
    const workout = new Workout(req.body);
    await workout.save();

    return res.status(201).json({
      success: true,
      workout
    });
  } catch (err) {
    console.error("Error saving workout:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Delete workout endpoint
app.delete('/api/workouts/:id', async (req, res) => {
  try {
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
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

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.get('/api/user', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Server error fetching user data' });
  }
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  console.log('Setting up static file serving for production');
  // Serve static files from the React frontend app
  app.use('/app', express.static(path.join(__dirname, '../../client/build')));

  // Handle React routing, return all requests to React app
  app.get('/app/*', (req, res) => {
    console.log('Serving React app for path:', req.path);
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});