const express = require('express');
const router = express.Router();
const Exercise = require('../models/exercise');
const { uploadMiddleware } = require('../middleware/upload');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// GET /exercises - Get all exercises with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      muscleGroup,
      category,
      difficulty,
      equipment,
      approved,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (muscleGroup && muscleGroup !== 'All') {
      filter.muscleGroup = muscleGroup;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }

    if (equipment && equipment !== 'All') {
      filter.equipment = equipment;
    }

    if (approved !== undefined) {
      filter.approved = approved === 'true';
    }

    // Handle search
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const exercises = await Exercise.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalCount = await Exercise.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: exercises,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      filters: {
        muscleGroup,
        category,
        difficulty,
        equipment,
        approved,
        search
      }
    });

  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercises',
      error: error.message
    });
  }
});

// GET /exercises/:id - Get single exercise
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // Increment usage count
    await exercise.incrementUsage();

    res.json({
      success: true,
      data: exercise
    });

  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercise',
      error: error.message
    });
  }
});

// POST /exercises - Create new exercise
router.post('/', uploadMiddleware.exerciseMedia, async (req, res) => {
  try {
    const exerciseData = { ...req.body };

    // Handle file uploads
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        exerciseData.imageUrl = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.video && req.files.video[0]) {
        exerciseData.videoDemo = `/uploads/${req.files.video[0].filename}`;
      }
    }

    // Process tags
    if (exerciseData.tags && typeof exerciseData.tags === 'string') {
      exerciseData.tags = exerciseData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Parse numeric fields
    const numericFields = ['repMin', 'repMax', 'restMin', 'restMax', 'tutTotal', 'velocityTarget', 'workoutDuration', 'tabataWork', 'tabataRest', 'distance', 'rounds'];
    numericFields.forEach(field => {
      if (exerciseData[field] && exerciseData[field] !== '') {
        exerciseData[field] = parseFloat(exerciseData[field]);
      }
    });

    // Build nested objects
    if (exerciseData.repMin || exerciseData.repMax) {
      exerciseData.repRange = {
        min: exerciseData.repMin || 0,
        max: exerciseData.repMax || 0
      };
      delete exerciseData.repMin;
      delete exerciseData.repMax;
    }

    if (exerciseData.restMin || exerciseData.restMax) {
      exerciseData.restTime = {
        min: exerciseData.restMin || 0,
        max: exerciseData.restMax || 0
      };
      delete exerciseData.restMin;
      delete exerciseData.restMax;
    }

    if (exerciseData.tutPattern || exerciseData.tutTotal) {
      exerciseData.timeUnderTension = {
        pattern: exerciseData.tutPattern,
        total: exerciseData.tutTotal || 0
      };
      delete exerciseData.tutPattern;
      delete exerciseData.tutTotal;
    }

    if (exerciseData.velocityTracking || exerciseData.velocityTarget) {
      exerciseData.velocityTracking = {
        required: exerciseData.velocityTracking,
        target: exerciseData.velocityTarget || 0
      };
      delete exerciseData.velocityTarget;
    }

    if (exerciseData.tabataWork || exerciseData.tabataRest) {
      exerciseData.tabataTimer = {
        work: exerciseData.tabataWork || 0,
        rest: exerciseData.tabataRest || 0
      };
      delete exerciseData.tabataWork;
      delete exerciseData.tabataRest;
    }

    if (exerciseData.distance || exerciseData.units) {
      exerciseData.distance = {
        value: exerciseData.distance || 0,
        units: exerciseData.units
      };
      delete exerciseData.units;
    }

    // Create exercise
    const exercise = new Exercise(exerciseData);
    await exercise.save();

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: exercise
    });

  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating exercise',
      error: error.message
    });
  }
});

// PUT /exercises/:id - Update exercise
router.put('/:id', uploadMiddleware.exerciseMedia, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    const updateData = { ...req.body };

    // Handle file uploads
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        updateData.imageUrl = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.video && req.files.video[0]) {
        updateData.videoDemo = `/uploads/${req.files.video[0].filename}`;
      }
    }

    // Process tags
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Update exercise
    Object.assign(exercise, updateData);
    await exercise.save();

    res.json({
      success: true,
      message: 'Exercise updated successfully',
      data: exercise
    });

  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating exercise',
      error: error.message
    });
  }
});

// DELETE /exercises/:id - Delete exercise
router.delete('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    await Exercise.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Exercise deleted successfully'
    });

  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting exercise',
      error: error.message
    });
  }
});

// POST /exercises/:id/approve - Approve exercise
router.post('/:id/approve', async (req, res) => {
  try {
    const { approvedBy = 'Admin' } = req.body;
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    await exercise.approve(approvedBy);

    res.json({
      success: true,
      message: 'Exercise approved successfully',
      data: exercise
    });

  } catch (error) {
    console.error('Approve exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving exercise',
      error: error.message
    });
  }
});

// POST /exercises/:id/discussions - Add discussion comment
router.post('/:id/discussions', async (req, res) => {
  try {
    const { user, text, isCoach = false } = req.body;
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    if (!user || !text) {
      return res.status(400).json({
        success: false,
        message: 'User and text are required'
      });
    }

    await exercise.addDiscussion(user, text, isCoach);

    res.json({
      success: true,
      message: 'Discussion added successfully',
      data: exercise
    });

  } catch (error) {
    console.error('Add discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding discussion',
      error: error.message
    });
  }
});

// GET /exercises/stats/summary - Get exercise statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalCount = await Exercise.getTotalCount();
    const approvedCount = await Exercise.getApprovedCount();
    const pendingCount = totalCount - approvedCount;

    // Get popular exercises
    const popularExercises = await Exercise.find({ approved: true })
      .sort({ usageCount: -1 })
      .limit(5)
      .select('name usageCount');

    // Get muscle group distribution
    const muscleGroupStats = await Exercise.aggregate([
      { $match: { approved: true } },
      { $group: { _id: '$muscleGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get category distribution
    const categoryStats = await Exercise.aggregate([
      { $match: { approved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get recent exercises
    const recentExercises = await Exercise.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt');

    res.json({
      success: true,
      data: {
        summary: {
          totalCount,
          approvedCount,
          pendingCount,
          approvalRate: totalCount > 0 ? (approvedCount / totalCount * 100).toFixed(1) : 0
        },
        popularExercises,
        muscleGroupStats,
        categoryStats,
        recentExercises
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// POST /import - Import exercises from Excel file
router.post('/import', uploadMiddleware.excelFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is required'
      });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = {
      imported: 0,
      errors: [],
      duplicates: 0
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const rowNum = i + 2; // Excel row number (starting from 2)

        // Check for required fields
        if (!row.name || !row.description || !row.muscleGroup || !row.category) {
          results.errors.push({
            row: rowNum,
            error: 'Missing required fields (name, description, muscleGroup, category)'
          });
          continue;
        }

        // Check for duplicates
        const existingExercise = await Exercise.findOne({ name: row.name });
        if (existingExercise) {
          results.duplicates++;
          continue;
        }

        // Create exercise object
        const exerciseData = {
          name: row.name,
          description: row.description,
          muscleGroup: row.muscleGroup,
          category: row.category,
          difficulty: row.difficulty || 'Beginner',
          equipment: row.equipment || 'None',
          loadType: row.loadType,
          executionMode: row.executionMode,
          primaryPurpose: row.primaryPurpose,
          sport: row.sport,
          tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
          notes: row.notes,
          clientAdjustments: row.clientAdjustments,
          approved: row.approved === 'true' || row.approved === true,
          createdBy: 'Import'
        };

        // Handle numeric fields
        if (row.repMin || row.repMax) {
          exerciseData.repRange = {
            min: parseInt(row.repMin) || 0,
            max: parseInt(row.repMax) || 0
          };
        }

        if (row.restMin || row.restMax) {
          exerciseData.restTime = {
            min: parseInt(row.restMin) || 0,
            max: parseInt(row.restMax) || 0
          };
        }

        // Create and save exercise
        const exercise = new Exercise(exerciseData);
        await exercise.save();
        results.imported++;

      } catch (error) {
        results.errors.push({
          row: i + 2,
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Import completed. ${results.imported} exercises imported.`,
      results
    });

  } catch (error) {
    console.error('Import error:', error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error importing exercises',
      error: error.message
    });
  }
});

module.exports = router;