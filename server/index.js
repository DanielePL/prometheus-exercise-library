// server/index.js - Express server setup
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Replace the existing mongoose.connect line with this:
mongoose.connect('mongodb+srv://danielepauli:Prometheus_2025@prometheus.bgnn6by.mongodb.net/prometheus-exercises?retryWrites=true&w=majority&appName=Prometheus', {
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

app.listen(5000, () => {
  console.log('Server running on port 5000');
});