const mongoose = require('mongoose');

// Discussion/Comment schema
const discussionSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isCoach: {
    type: Boolean,
    default: false
  }
}, { _id: true });

// Main exercise schema
const exerciseSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },

  // Classification
  muscleGroup: {
    type: String,
    required: true,
    enum: [
      'Neck', 'Traps (Trapezius)', 'Shoulders (Deltoids)',
      'Chest (Pectoralis)', 'Back (Latissimus Dorsi)', 'Back (Rhomboids)',
      'Back (Erector Spinae)', 'Biceps (Biceps Brachii)', 'Triceps (Triceps Brachii)',
      'Forearms', 'Abdominals (Rectus Abdominis)', 'Obliques',
      'Lower Back (Erector Spinae)', 'Quadriceps', 'Hamstrings',
      'Glutes', 'Hip Flexors', 'Calves (Gastrocnemius)', 'Calves (Soleus)',
      'Full Body', 'Upper Body', 'Lower Body', 'Push (Chest/Shoulders/Triceps)',
      'Pull (Back/Biceps)', 'Legs (Quads/Hamstrings/Glutes)', 'Core', 'Arms'
    ]
  },

  category: {
    type: String,
    required: true,
    enum: [
      'Strength', 'Power', 'Hypertrophy', 'Endurance', 'Stability', 'Mobility',
      'Flexibility', 'Speed', 'Agility', 'Cardio', 'Recovery', 'Compound',
      'Isolation', 'Push', 'Pull', 'Hinge', 'Squat', 'Lunge', 'Carry',
      'Rotation', 'Anti-rotation', 'Concentric Focus', 'Eccentric Focus',
      'Isometric/Hold', 'Plyometric', 'Ballistic', 'Quarter Reps', 'Half Reps',
      'Full Reps', 'Tempo', 'Explosive', 'Slow & Controlled', 'Bodyweight',
      'Free Weights', 'Machine', 'Cable', 'Resistance Band', 'Suspension',
      'Kettlebell', 'Medicine Ball', 'Sled/Prowler', 'Drop Sets', 'Super Sets',
      'Giant Sets', 'Tri-Sets', 'Rest-Pause', 'AMRAP', 'EMOM', 'Tabata',
      'Pyramid', 'Reverse Pyramid', 'Pre-Exhaustion', 'Post-Exhaustion',
      'Time Under Tension', 'CrossFit', 'HYROX', 'Powerlifting',
      'Olympic Weightlifting', 'Bodybuilding', 'Strongman', 'Calisthenics',
      'Functional Fitness', 'Sports Performance', 'Rehabilitation'
    ]
  },

  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Elite']
  },

  // Equipment and Setup
  equipment: {
    type: String,
    required: true,
    enum: [
      'None', 'Barbell', 'Dumbbell', 'Kettlebell', 'Machine', 'Cable',
      'Resistance Band', 'Bodyweight', 'Medicine Ball', 'Sandbag',
      'TRX/Suspension', 'Battle Ropes', 'Slam Ball', 'Box', 'Bench',
      'Pull-up Bar', 'Parallel Bars', 'Other'
    ]
  },

  loadType: {
    type: String,
    enum: ['Free Weight', 'Machine Weight', 'Bodyweight', 'Resistance', 'Variable', 'No Load']
  },

  executionMode: {
    type: String,
    enum: ['Concentric', 'Eccentric', 'Isometric', 'Plyometric', 'Ballistic', 'Complex']
  },

  // Performance Parameters
  repRange: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 }
  },

  setScheme: {
    type: String,
    enum: [
      'Standard Sets', 'Super Sets', 'Giant Sets', 'Drop Sets',
      'Pyramid', 'Reverse Pyramid', 'EMOM', 'AMRAP', 'For Time'
    ]
  },

  restTime: {
    min: { type: Number, min: 0 }, // in seconds
    max: { type: Number, min: 0 }
  },

  timeUnderTension: {
    pattern: {
      type: String,
      enum: ['2-0-2-0', '3-0-1-0', '3-1-3-1', '4-0-1-0', '5-0-1-0', 'Custom']
    },
    total: { type: Number, min: 0 }
  },

  // Advanced Tracking
  velocityTracking: {
    required: {
      type: String,
      enum: ['Required', 'Optional', 'Not Applicable']
    },
    target: { type: Number, min: 0 } // m/s
  },

  barPathTracking: {
    type: String,
    enum: ['Required', 'Optional', 'Not Applicable']
  },

  // Programming
  primaryPurpose: {
    type: String,
    enum: [
      'Strength', 'Hypertrophy', 'Power', 'Endurance', 'Mobility',
      'Stability', 'Conditioning', 'Skill Development'
    ]
  },

  progressionType: {
    type: String,
    enum: [
      'Linear Weight', 'Rep Progression', 'Density (more work in same time)',
      'Volume (sets x reps)', 'Technique Focus', 'Velocity Based', 'Relative Intensity'
    ]
  },

  // Sport and Context
  sport: {
    type: String,
    enum: [
      'Powerlifting', 'Weightlifting', 'Bodybuilding', 'CrossFit', 'HYROX',
      'Functional Fitness', 'General Strength', 'Sports Performance'
    ]
  },

  accessoryPairing: {
    type: String
  },

  conditioningComponent: {
    type: Boolean,
    default: false
  },

  competitionStandard: {
    type: Boolean,
    default: false
  },

  // Timing and Measurement
  workoutDuration: { type: Number, min: 0 }, // minutes

  tabataTimer: {
    work: { type: Number, min: 0 }, // seconds
    rest: { type: Number, min: 0 }  // seconds
  },

  distance: {
    value: { type: Number, min: 0 },
    units: {
      type: String,
      enum: ['m', 'km', 'ft', 'mi', 'reps', 'cal']
    }
  },

  rounds: { type: Number, min: 0 },

  // Media
  imageUrl: {
    type: String,
    default: '/api/placeholder/400/300'
  },

  videoDemo: {
    type: String
  },

  // Additional Information
  tags: [{
    type: String,
    trim: true
  }],

  notes: {
    type: String // Coach notes
  },

  clientAdjustments: {
    type: String // Client-specific modifications
  },

  // Status and Approval
  approved: {
    type: Boolean,
    default: false
  },

  approvedBy: {
    type: String
  },

  approvedAt: {
    type: Date
  },

  // Discussion
  discussions: [discussionSchema],

  // Metadata
  createdBy: {
    type: String,
    default: 'System'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Usage Statistics
  usageCount: {
    type: Number,
    default: 0
  },

  lastUsed: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
exerciseSchema.index({ name: 'text', description: 'text' });
exerciseSchema.index({ muscleGroup: 1, category: 1 });
exerciseSchema.index({ approved: 1 });
exerciseSchema.index({ createdAt: -1 });
exerciseSchema.index({ usageCount: -1 });

// Virtual for discussion count
exerciseSchema.virtual('discussionCount').get(function() {
  return this.discussions ? this.discussions.length : 0;
});

// Virtual for formatted rep range
exerciseSchema.virtual('repRangeFormatted').get(function() {
  if (this.repRange && this.repRange.min && this.repRange.max) {
    return `${this.repRange.min}-${this.repRange.max}`;
  }
  return null;
});

// Virtual for formatted rest time
exerciseSchema.virtual('restTimeFormatted').get(function() {
  if (this.restTime && this.restTime.min && this.restTime.max) {
    return `${this.restTime.min}-${this.restTime.max} sec`;
  }
  return null;
});

// Pre-save middleware
exerciseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
exerciseSchema.statics.findByMuscleGroup = function(muscleGroup) {
  return this.find({ muscleGroup: muscleGroup, approved: true });
};

exerciseSchema.statics.findByCategory = function(category) {
  return this.find({ category: category, approved: true });
};

exerciseSchema.statics.searchByName = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    approved: true
  }).sort({ score: { $meta: 'textScore' } });
};

exerciseSchema.statics.getApprovedCount = function() {
  return this.countDocuments({ approved: true });
};

exerciseSchema.statics.getTotalCount = function() {
  return this.countDocuments({});
};

// Instance methods
exerciseSchema.methods.addDiscussion = function(user, text, isCoach = false) {
  this.discussions.push({
    user: user,
    text: text,
    isCoach: isCoach,
    date: new Date()
  });
  return this.save();
};

exerciseSchema.methods.approve = function(approvedBy) {
  this.approved = true;
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

exerciseSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

module.exports = mongoose.model('Exercise', exerciseSchema);