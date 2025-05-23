require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prometheus-exercises';
mongoose.connect(MONGODB_URI)
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
  description: String,
  difficulty: String,
  imageUrl: String,
  approved: { type: Boolean, default: false },
  discussions: [{
    id: Number,
    user: String,
    text: String,
    date: String
  }],
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
        { notes: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
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

app.delete('/api/exercises/:id', async (req, res) => {
  try {
    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exercise deleted successfully' });
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
          progressionType: row['Progression Type'] || '',
          timeUnderTension: row['Time Under Tension'] || '',
          barPathTracking: row['Bar Path Tracking'] === 'X',
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
          description: row['Description'] || '',
          difficulty: row['Difficulty'] || 'Intermediate',
          imageUrl: row['Image URL'] || '/api/placeholder/400/300',
          approved: false,
          discussions: []
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

// AI Exercise Search endpoint
app.post('/api/ai-search', async (req, res) => {
  try {
    const { searchTerm } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: 'OpenAI API key not configured' });
    }

    const prompt = `Generate detailed exercise information for: "${searchTerm}". 
    Return as JSON array with exactly 5 exercises, each having these fields:
    - name (string)
    - description (string, detailed instructions)
    - muscleTargets (array of strings)
    - equipment (string)
    - category (string)
    - difficulty (string: Beginner/Intermediate/Advanced)
    - sport (string)
    
    Make sure the response is valid JSON only.`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a fitness expert. Return only valid JSON without any additional text or formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const exercisesText = response.data.choices[0].message.content;
    const exercises = JSON.parse(exercisesText);

    res.json({ success: true, exercises });
  } catch (err) {
    console.error('AI Search Error:', err);
    res.status(500).json({ error: 'Failed to search exercises with AI' });
  }
});

// Statistics endpoint for dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const totalExercises = await Exercise.countDocuments();
    const approvedExercises = await Exercise.countDocuments({ approved: true });
    const pendingApproval = await Exercise.countDocuments({ approved: false });

    // Get exercises by muscle group
    const muscleGroupStats = await Exercise.aggregate([
      { $unwind: "$muscleTargets" },
      { $group: { _id: "$muscleTargets", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get exercises by sport
    const sportStats = await Exercise.aggregate([
      { $group: { _id: "$sport", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalExercises,
      approvedExercises,
      pendingApproval,
      muscleGroupStats,
      sportStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});