require('dotenv').config();
const mongoose = require('mongoose');
const Exercise = require('../models/exercise');

// Sample exercise data
const sampleExercises = [
  {
    name: 'Barbell Bench Press',
    description: 'Lie on a flat bench with feet on the ground. Grip the barbell with hands slightly wider than shoulder-width apart. Lower the bar to your mid-chest, then press back up to full arm extension.',
    muscleGroup: 'Chest (Pectoralis)',
    category: 'Strength',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    loadType: 'Free Weight',
    executionMode: 'Concentric',
    repRange: { min: 6, max: 12 },
    restTime: { min: 60, max: 180 },
    timeUnderTension: { pattern: '2-0-2-0', total: 24 },
    velocityTracking: { required: 'Optional', target: 0.5 },
    barPathTracking: 'Required',
    primaryPurpose: 'Strength',
    progressionType: 'Linear Weight',
    sport: 'Powerlifting',
    tags: ['compound', 'upper body', 'push'],
    notes: 'Focus on controlled descent and explosive concentric phase.',
    approved: true,
    usageCount: 150,
    createdBy: 'Seed Script'
  },
  {
    name: 'Pull-ups',
    description: 'Hang from a pull-up bar with palms facing away from you. Pull your body up until your chin is above the bar, then lower back down with control.',
    muscleGroup: 'Back (Latissimus Dorsi)',
    category: 'Bodyweight',
    difficulty: 'Advanced',
    equipment: 'Pull-up Bar',
    loadType: 'Bodyweight',
    executionMode: 'Concentric',
    repRange: { min: 3, max: 15 },
    restTime: { min: 90, max: 180 },
    timeUnderTension: { pattern: '2-0-3-1', total: 36 },
    primaryPurpose: 'Strength',
    progressionType: 'Rep Progression',
    sport: 'Calisthenics',
    tags: ['bodyweight', 'upper body', 'pull', 'back'],
    notes: 'Start with assisted variations if unable to perform full pull-ups.',
    approved: true,
    usageCount: 120,
    createdBy: 'Seed Script'
  },
  {
    name: 'Barbell Back Squat',
    description: 'Stand with feet shoulder-width apart, barbell resting on upper traps. Lower your body by bending your knees and pushing your hips back, as if sitting in a chair. Return to starting position.',
    muscleGroup: 'Legs (Quads/Hamstrings/Glutes)',
    category: 'Compound',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    loadType: 'Free Weight',
    executionMode: 'Concentric',
    repRange: { min: 5, max: 15 },
    restTime: { min: 120, max: 300 },
    timeUnderTension: { pattern: '3-0-2-0', total: 30 },
    velocityTracking: { required: 'Required', target: 0.4 },
    barPathTracking: 'Required',
    primaryPurpose: 'Strength',
    progressionType: 'Linear Weight',
    sport: 'Powerlifting',
    tags: ['compound', 'lower body', 'squat', 'legs'],
    notes: 'Maintain neutral spine and ensure knees track over toes.',
    approved: true,
    usageCount: 200,
    createdBy: 'Seed Script'
  },
  {
    name: 'Conventional Deadlift',
    description: 'Stand with feet hip-width apart, barbell over midfoot. Bend at hips and knees to grip the bar. Keep back flat as you lift the bar by extending hips and knees.',
    muscleGroup: 'Full Body',
    category: 'Compound',
    difficulty: 'Advanced',
    equipment: 'Barbell',
    loadType: 'Free Weight',
    executionMode: 'Concentric',
    repRange: { min: 1, max: 8 },
    restTime: { min: 180, max: 300 },
    timeUnderTension: { pattern: '2-0-3-0', total: 25 },
    velocityTracking: { required: 'Required', target: 0.3 },
    barPathTracking: 'Required',
    primaryPurpose: 'Strength',
    progressionType: 'Linear Weight',
    sport: 'Powerlifting',
    tags: ['compound', 'full body', 'hip hinge', 'posterior chain'],
    notes: 'Essential exercise for posterior chain development. Focus on hip hinge pattern.',
    approved: true,
    usageCount: 180,
    createdBy: 'Seed Script'
  },
  {
    name: 'Overhead Press',
    description: 'Stand with feet shoulder-width apart, barbell at shoulder height. Press the weight upward until arms are extended overhead, then lower back to starting position.',
    muscleGroup: 'Shoulders (Deltoids)',
    category: 'Strength',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    loadType: 'Free Weight',
    executionMode: 'Concentric',
    repRange: { min: 5, max: 12 },
    restTime: { min: 90, max: 180 },
    timeUnderTension: { pattern: '2-0-2-1', total: 30 },
    primaryPurpose: 'Strength',
    progressionType: 'Linear Weight',
    sport: 'Powerlifting',
    tags: ['overhead', 'shoulders', 'press', 'upper body'],
    notes: 'Keep core tight and avoid arching back excessively.',
    approved: true,
    usageCount: 95,
    createdBy: 'Seed Script'
  },
  {
    name: 'Plank',
    description: 'Get into a push-up position but with forearms on the ground. Maintain a straight line from head to heels, engaging core muscles.',
    muscleGroup: 'Core',
    category: 'Isometric/Hold',
    difficulty: 'Beginner',
    equipment: 'None',
    loadType: 'Bodyweight',
    executionMode: 'Isometric',
    timeUnderTension: { pattern: 'Hold', total: 60 },
    primaryPurpose: 'Stability',
    progressionType: 'Time Extension',
    sport: 'General Strength',
    tags: ['core', 'isometric', 'stability', 'bodyweight'],
    notes: 'Start with shorter holds and gradually increase duration.',
    approved: true,
    usageCount: 85,
    createdBy: 'Seed Script'
  },
  {
    name: 'Bulgarian Split Squat',
    description: 'Stand 2-3 feet in front of a bench. Place top of one foot on the bench behind you. Lower your body until your front thigh is parallel to the floor.',
    muscleGroup: 'Legs (Quads/Hamstrings/Glutes)',
    category: 'Unilateral',
    difficulty: 'Intermediate',
    equipment: 'Bench',
    loadType: 'Bodyweight',
    executionMode: 'Concentric',
    repRange: { min: 8, max: 20 },
    restTime: { min: 60, max: 120 },
    timeUnderTension: { pattern: '2-0-2-0', total: 24 },
    primaryPurpose: 'Strength',
    progressionType: 'Rep Progression',
    sport: 'Functional Fitness',
    tags: ['unilateral', 'lunge', 'single leg', 'balance'],
    notes: 'Great for addressing imbalances and improving single-leg strength.',
    approved: true,
    usageCount: 70,
    createdBy: 'Seed Script'
  },
  {
    name: 'Kettlebell Swing',
    description: 'Stand with feet shoulder-width apart, holding a kettlebell with both hands. Hinge at hips and swing the kettlebell between your legs, then thrust hips forward to swing the kettlebell to chest height.',
    muscleGroup: 'Full Body',
    category: 'Explosive',
    difficulty: 'Intermediate',
    equipment: 'Kettlebell',
    loadType: 'Free Weight',
    executionMode: 'Ballistic',
    repRange: { min: 15, max: 50 },
    restTime: { min: 45, max: 90 },
    primaryPurpose: 'Power',
    progressionType: 'Volume (sets x reps)',
    sport: 'CrossFit',
    tags: ['explosive', 'hip hinge', 'conditioning', 'full body'],
    notes: 'Focus on hip drive, let the kettlebell float at the top.',
    approved: true,
    usageCount: 110,
    createdBy: 'Seed Script'
  },
  {
    name: 'Burpees',
    description: 'Start standing, drop into a squat with hands on floor, jump feet back to plank, do a push-up, jump feet back to squat, then jump up with arms overhead.',
    muscleGroup: 'Full Body',
    category: 'Conditioning',
    difficulty: 'Intermediate',
    equipment: 'None',
    loadType: 'Bodyweight',
    executionMode: 'Plyometric',
    repRange: { min: 5, max: 30 },
    restTime: { min: 30, max: 90 },
    primaryPurpose: 'Conditioning',
    progressionType: 'Density (more work in same time)',
    sport: 'CrossFit',
    tags: ['full body', 'conditioning', 'bodyweight', 'explosive'],
    notes: 'High intensity exercise, scale as needed for fitness level.',
    approved: true,
    usageCount: 65,
    createdBy: 'Seed Script'
  },
  {
    name: 'Face Pulls',
    description: 'Set cable machine to upper chest height. Pull the rope towards your face, separating the rope ends as you pull, focusing on squeezing shoulder blades together.',
    muscleGroup: 'Back (Rhomboids)',
    category: 'Isolation',
    difficulty: 'Beginner',
    equipment: 'Cable',
    loadType: 'Machine Weight',
    executionMode: 'Concentric',
    repRange: { min: 12, max: 25 },
    restTime: { min: 30, max: 60 },
    timeUnderTension: { pattern: '2-1-2-1', total: 36 },
    primaryPurpose: 'Stability',
    progressionType: 'Rep Progression',
    sport: 'General Strength',
    tags: ['rear delt', 'posture', 'isolation', 'upper back'],
    notes: 'Excellent for posture improvement and shoulder health.',
    approved: true,
    usageCount: 55,
    createdBy: 'Seed Script'
  }
];

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prometheus-exercise-library';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing exercises (optional - comment out if you want to keep existing data)
    // await Exercise.deleteMany({});
    // console.log('🗑️  Cleared existing exercises');

    // Check for existing exercises to avoid duplicates
    const existingExercises = await Exercise.find({}).select('name');
    const existingNames = existingExercises.map(ex => ex.name);

    // Filter out exercises that already exist
    const newExercises = sampleExercises.filter(ex => !existingNames.includes(ex.name));

    if (newExercises.length === 0) {
      console.log('📋 All sample exercises already exist in the database');
      return;
    }

    // Insert new exercises
    const insertedExercises = await Exercise.insertMany(newExercises);

    console.log(`✅ Successfully seeded ${insertedExercises.length} exercises`);
    console.log('📊 Seeded exercises:');
    insertedExercises.forEach((ex, index) => {
      console.log(`   ${index + 1}. ${ex.name} (${ex.muscleGroup})`);
    });

    // Generate some sample discussions
    console.log('💬 Adding sample discussions...');

    const exercisesWithDiscussions = await Exercise.find({ approved: true }).limit(3);

    for (const exercise of exercisesWithDiscussions) {
      await exercise.addDiscussion('Coach Mike', 'Great exercise for building strength!', true);
      await exercise.addDiscussion('Trainer Sarah', 'Make sure to focus on proper form.', true);
    }

    console.log('✅ Added sample discussions');

    // Display final statistics
    const totalCount = await Exercise.countDocuments();
    const approvedCount = await Exercise.countDocuments({ approved: true });

    console.log('\n📈 Database Statistics:');
    console.log(`   Total exercises: ${totalCount}`);
    console.log(`   Approved exercises: ${approvedCount}`);
    console.log(`   Pending approval: ${totalCount - approvedCount}`);

    console.log('\n🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedDatabase();
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
};

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Seeding interrupted');
  await mongoose.connection.close();
  process.exit(1);
});

// Run the seeding script
if (require.main === module) {
  main();
}

module.exports = { sampleExercises, seedDatabase };