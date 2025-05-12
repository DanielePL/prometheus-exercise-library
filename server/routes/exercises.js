// Example of simplified route without MongoDB
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Mock data
const exercises = [
  { id: 1, name: 'Push-up', muscle: 'Chest', description: 'Classic push-up exercise' },
  { id: 2, name: 'Pull-up', muscle: 'Back', description: 'Upper body compound exercise' },
  // Add more mock data as needed
];

// Get all exercises
router.get('/', (req, res) => {
  res.json(exercises);
});

// Get exercise by ID
router.get('/:id', (req, res) => {
  const exercise = exercises.find(ex => ex.id === parseInt(req.params.id));
  if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
  res.json(exercise);
});

// Protected routes
router.post('/', authenticate, (req, res) => {
  // Simplified mock implementation
  res.status(201).json({ message: 'Exercise created (mock)' });
});

module.exports = router;
