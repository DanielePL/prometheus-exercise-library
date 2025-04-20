const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Workout schema
const workoutSchema = new mongoose.Schema({
  name: String,
  source: String,
  date: Date,
  type: String,
  description: String,
  exercises: Array,
  scoreType: String,
  categories: [String],
  difficulty: String,
  createdAt: { type: Date, default: Date.now }
});

// Initialize database connection
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Crawler connected to MongoDB');
  } catch (error) {
    console.error('Crawler MongoDB connection error:', error);
    throw error;
  }
}

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = {
  connectToDatabase,
  Workout
};