import React, { useState, useEffect } from 'react';
import { Search, Filter, Save, X, Edit, MessageSquare, CheckCircle, ChevronLeft, ChevronRight, Sparkles, Plus } from 'lucide-react';
import AISearch from './AISearch';
import AISearchModal from './AISearchModal';
import { analyzeSearchQuery, processExercisesWithAI, smartSearchFallback, isOpenAIAvailable } from '../services/openai';

// Main component
function PrometheusExerciseLibrary() {
  // State for exercises
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAISearch, setIsAISearch] = useState(false);
  const [searchMetadata, setSearchMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAISearchModal, setShowAISearchModal] = useState(false);
  const exercisesPerPage = 9;

  // Sample data - replace with actual data fetching
  useEffect(() => {
    // This would be replaced with an API call in a real application
    const sampleExercises = [
      {
        id: 1,
        name: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        category: 'Strength',
        description: 'Lie on a flat bench with feet on the ground. Grip the barbell with hands slightly wider than shoulder-width apart. Lower the bar to your mid-chest, then press back up to full arm extension.',
        difficulty: 'Intermediate',
        equipment: 'Barbell, Bench',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: [
          { id: 1, user: 'Coach Mike', text: 'Great exercise for overall chest development.', date: '2025-04-05' },
          { id: 2, user: 'Coach Sarah', text: 'Should we add variations for incline and decline?', date: '2025-04-07' }
        ]
      },
      {
        id: 2,
        name: 'Pull-ups',
        muscleGroup: 'Back',
        category: 'Bodyweight',
        description: 'Hang from a pull-up bar with palms facing away from you. Pull your body up until your chin is above the bar, then lower back down with control.',
        difficulty: 'Advanced',
        equipment: 'Pull-up Bar',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: []
      },
      {
        id: 3,
        name: 'Squat',
        muscleGroup: 'Legs',
        category: 'Compound',
        description: 'Stand with feet shoulder-width apart. Lower your body by bending your knees and pushing your hips back, as if sitting in a chair. Return to starting position.',
        difficulty: 'Beginner',
        equipment: 'None (bodyweight) or Barbell',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: []
      },
      {
        id: 4,
        name: 'Dumbbell Shoulder Press',
        muscleGroup: 'Shoulders',
        category: 'Strength',
        description: 'Sit or stand with dumbbells at shoulder height. Press the weights upward until arms are extended, then lower back to starting position.',
        difficulty: 'Intermediate',
        equipment: 'Dumbbells',
        imageUrl: '/api/placeholder/400/300',
        approved: false,
        discussions: [
          { id: 1, user: 'Coach Jen', text: 'Need to clarify seated vs standing variation.', date: '2025-04-08' }
        ]
      },
      {
        id: 5,
        name: 'Plank',
        muscleGroup: 'Core',
        category: 'Isometric',
        description: 'Get into a push-up position but with forearms on the ground. Maintain a straight line from head to heels, engaging core muscles.',
        difficulty: 'Beginner',
        equipment: 'None',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: []
      },
      {
        id: 6,
        name: 'Deadlift',
        muscleGroup: 'Back',
        category: 'Compound',
        description: 'Stand with feet hip-width apart, barbell over midfoot. Bend at hips and knees to grip the bar. Keep back flat as you lift the bar by extending hips and knees.',
        difficulty: 'Advanced',
        equipment: 'Barbell',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: [
          { id: 1, user: 'Coach Alex', text: 'Essential exercise for posterior chain development.', date: '2025-04-03' }
        ]
      },
      {
        id: 7,
        name: 'Lunges',
        muscleGroup: 'Legs',
        category: 'Bodyweight',
        description: 'Step forward with one leg, lowering your hips until both knees are bent at about a 90-degree angle. Return to starting position and repeat with the other leg.',
        difficulty: 'Beginner',
        equipment: 'None or Dumbbells',
        imageUrl: '/api/placeholder/400/300',
        approved: false,
        discussions: []
      },
      {
        id: 8,
        name: 'Dips',
        muscleGroup: 'Chest',
        category: 'Bodyweight',
        description: 'Support your weight on parallel bars with arms straight. Lower your body by bending your arms, then press back up to the starting position.',
        difficulty: 'Intermediate',
        equipment: 'Parallel Bars',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: []
      },
      {
        id: 9,
        name: 'Kettlebell Swing',
        muscleGroup: 'Full Body',
        category: 'Explosive',
        description: 'Stand with feet shoulder-width apart, holding a kettlebell with both hands. Hinge at hips and swing the kettlebell between your legs, then thrust hips forward to swing the kettlebell to chest height.',
        difficulty: 'Intermediate',
        equipment: 'Kettlebell',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: []
      },
      {
        id: 10,
        name: 'Bicep Curl',
        muscleGroup: 'Arms',
        category: 'Isolation',
        description: 'Hold dumbbells at your sides with palms facing forward. Keeping upper arms stationary, bend at the elbow and curl the weights toward your shoulders.',
        difficulty: 'Beginner',
        equipment: 'Dumbbells or Barbell',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: []
      },
      {
        id: 11,
        name: 'Tricep Extension',
        muscleGroup: 'Arms',
        category: 'Isolation',
        description: 'Hold a dumbbell with both hands above your head. Lower the weight behind your head by bending at the elbows, then extend arms to return to starting position.',
        difficulty: 'Beginner',
        equipment: 'Dumbbell',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: []
      },
      {
        id: 12,
        name: 'Mountain Climbers',
        muscleGroup: 'Core',
        category: 'Cardio',
        description: 'Start in a plank position. Rapidly alternate bringing your knees toward your chest, as if running in place while maintaining the plank position.',
        difficulty: 'Intermediate',
        equipment: 'None',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: []
      },
      {
        id: 13,
        name: 'Romanian Deadlift',
        muscleGroup: 'Legs',
        category: 'Compound',
        description: 'Hold a barbell with an overhand grip. Keep your legs slightly bent and lower the bar by pushing your hips back, maintaining a straight back.',
        difficulty: 'Intermediate',
        equipment: 'Barbell',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: []
      },
      {
        id: 14,
        name: 'Push-ups',
        muscleGroup: 'Chest',
        category: 'Bodyweight',
        description: 'Start in a plank position with hands slightly wider than shoulder-width. Lower your body until your chest nearly touches the floor, then push back up.',
        difficulty: 'Beginner',
        equipment: 'None',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: []
      },
      {
        id: 15,
        name: 'Lat Pulldown',
        muscleGroup: 'Back',
        category: 'Strength',
        description: 'Sit at a lat pulldown machine. Grip the bar wider than shoulder-width and pull down to your upper chest, squeezing your shoulder blades together.',
        difficulty: 'Beginner',
        equipment: 'Machine',
        imageUrl: '/api/placeholder/400/300',
        approved: true,
        discussions: []
      }
    ];

    setExercises(sampleExercises);
    setFilteredExercises(sampleExercises);
  }, []);

  // Get unique muscle groups and categories for filters
  const muscleGroups = ['All', ...new Set(exercises.map(ex => ex.muscleGroup))];
  const categories = ['All', ...new Set(exercises.map(ex => ex.category))];

  // Enhanced AI search results handler
  const handleAISearchResults = async (results, query, isAI = false) => {
    setIsLoading(true);

    try {
      if (isAI && isOpenAIAvailable()) {
        // Use OpenAI for advanced analysis
        const aiAnalysis = await analyzeSearchQuery(query);

        if (aiAnalysis.success) {
          const processedResults = await processExercisesWithAI(exercises, aiAnalysis);
          setFilteredExercises(processedResults.results);
          setSearchMetadata({
            query,
            totalResults: processedResults.results.length,
            isAI: true,
            confidence: aiAnalysis.analysis.confidence,
            analysis: aiAnalysis.analysis
          });
        } else {
          // Fallback to smart search
          const fallbackResults = smartSearchFallback(query, exercises);
          setFilteredExercises(fallbackResults);
          setSearchMetadata({
            query,
            totalResults: fallbackResults.length,
            isAI: false,
            fallback: true
          });
        }
      } else {
        // Regular search or smart fallback
        setFilteredExercises(results);
        setSearchMetadata({
          query,
          totalResults: results.length,
          isAI: false
        });
      }

      setIsAISearch(isAI);
      setCurrentPage(1);

    } catch (error) {
      console.error('Search error:', error);
      // Ultimate fallback
      setFilteredExercises(results);
      setSearchMetadata({
        query,
        totalResults: results.length,
        isAI: false,
        error: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter exercises based on traditional filters
  useEffect(() => {
    if (!searchTerm && selectedMuscleGroup === 'All' && selectedCategory === 'All') {
      setFilteredExercises(exercises);
      setSearchMetadata(null);
      return;
    }

    let results = exercises;

    if (selectedMuscleGroup !== 'All') {
      results = results.filter(exercise => exercise.muscleGroup === selectedMuscleGroup);
    }

    if (selectedCategory !== 'All') {
      results = results.filter(exercise => exercise.category === selectedCategory);
    }

    setFilteredExercises(results);
    setCurrentPage(1);
  }, [selectedMuscleGroup, selectedCategory, exercises]);

  // Add new exercise (from manual form or AI discovery)
  const addExercise = (newExercise) => {
    const exerciseWithId = {
      ...newExercise,
      id: exercises.length + 1,
      approved: newExercise.approved !== undefined ? newExercise.approved : false,
      discussions: [],
      imageUrl: newExercise.imageUrl || '/api/placeholder/400/300'
    };
    setExercises([...exercises, exerciseWithId]);

    // Only close the manual add form, NOT the AI search modal
    if (showAddExerciseForm) {
      setShowAddExerciseForm(false);
    }
    // Keep AI search modal open - don't close it
  };

  // Add discussion comment
  const addComment = (exerciseId, comment) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          discussions: [
            ...ex.discussions,
            {
              id: ex.discussions.length + 1,
              user: 'Current Coach',
              text: comment,
              date: new Date().toISOString().split('T')[0]
            }
          ]
        };
      }
      return ex;
    }));

    // Update selected exercise if open
    if (selectedExercise && selectedExercise.id === exerciseId) {
      const updatedExercise = exercises.find(ex => ex.id === exerciseId);
      setSelectedExercise(updatedExercise);
    }
  };

  // Toggle approval status
  const toggleApproval = (exerciseId) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, approved: !ex.approved };
      }
      return ex;
    }));

    // Update selected exercise if open
    if (selectedExercise && selectedExercise.id === exerciseId) {
      const updatedExercise = exercises.find(ex => ex.id === exerciseId);
      setSelectedExercise(updatedExercise);
    }
  };

  // Open exercise details
  const openExerciseDetails = (exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDetails(true);
  };

  // Pagination logic
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  const changePage = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex h-full bg-black text-white">
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Filters */}
        <div className="w-64 bg-gray-900 p-4 flex flex-col">

          {/* AI Search Component */}
          <AISearch
            exercises={exercises}
            onSearchResults={handleAISearchResults}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* AI Discovery Button */}
          <button
            onClick={() => setShowAISearchModal(true)}
            className="w-full mb-4 bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all transform hover:scale-105"
          >
            <Sparkles size={18} />
            AI Exercise Discovery
          </button>

          {/* Search Results Info */}
          {searchMetadata && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                {searchMetadata.isAI ? (
                  <Sparkles size={14} className="text-orange-500" />
                ) : (
                  <Search size={14} className="text-gray-400" />
                )}
                <span className="text-xs font-medium text-orange-500">
                  {searchMetadata.isAI ? 'AI Search' : 'Standard Search'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {searchMetadata.totalResults} results for "{searchMetadata.query}"
              </p>
              {searchMetadata.confidence && (
                <p className="text-xs text-orange-400">
                  Confidence: {Math.round(searchMetadata.confidence * 100)}%
                </p>
              )}
              {searchMetadata.fallback && (
                <p className="text-xs text-yellow-400">Using smart fallback</p>
              )}
            </div>
          )}

          {/* Traditional Filters */}
          <div className="mb-4">
            <h3 className="font-medium mb-2 flex items-center gap-2 text-orange-500">
              <Filter size={16} /> Muscle Group
            </h3>
            <select
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
              value={selectedMuscleGroup}
              onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            >
              {muscleGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2 flex items-center gap-2 text-orange-500">
              <Filter size={16} /> Category
            </h3>
            <select
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <button className="w-full mt-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-orange-500 text-sm py-1.5 px-2 rounded flex items-center justify-center gap-1.5">
            <Plus size={14} />
            Add Advanced Filters
          </button>

          {/* Stats */}
          <div className="mt-4 bg-gray-800 p-3 rounded">
            <p className="text-sm text-gray-400">
              {filteredExercises.length} exercises found
            </p>
            <p className="text-sm text-gray-400">
              {exercises.filter(ex => ex.approved).length} approved / {exercises.length} total
            </p>
            {isOpenAIAvailable() && (
              <div className="flex items-center gap-1 mt-2">
                <Sparkles size={12} className="text-orange-500" />
                <span className="text-xs text-orange-500">AI Search Enabled</span>
              </div>
            )}
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex-1 p-4 overflow-auto bg-gray-950">
          {/* Header with Add Exercise Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Exercise Library</h2>
              <p className="text-gray-400">Manage your team's exercise collection</p>
            </div>
            <button
              onClick={() => setShowAddExerciseForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Plus size={20} />
              Add Custom Exercise
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="flex items-center gap-2">
                <Sparkles className="text-orange-500 animate-pulse" size={20} />
                <div className="text-orange-500">AI is analyzing your search...</div>
              </div>
            </div>
          )}

          {/* Exercise Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
              {currentExercises.map(exercise => (
                <div
                  key={exercise.id}
                  className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors border border-gray-800"
                  onClick={() => openExerciseDetails(exercise)}
                >
                  <div className="h-48 bg-gray-800 relative">
                    <img
                      src={exercise.imageUrl}
                      alt={exercise.name}
                      className="w-full h-full object-cover opacity-80"
                    />
                    {exercise.approved && (
                      <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded text-xs">
                        Approved
                      </div>
                    )}
                    {isAISearch && searchMetadata?.isAI && (
                      <div className="absolute top-2 left-2 bg-orange-600/20 text-orange-500 px-2 py-1 rounded text-xs border border-orange-500/30 flex items-center gap-1">
                        <Sparkles size={10} />
                        AI Match
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{exercise.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="bg-gray-800 text-orange-500 text-xs px-2 py-1 rounded border border-orange-500/20">
                        {exercise.muscleGroup}
                      </span>
                      <span className="bg-gray-800 text-orange-500 text-xs px-2 py-1 rounded border border-orange-500/20">
                        {exercise.category}
                      </span>
                      <span className="bg-gray-800 text-orange-500 text-xs px-2 py-1 rounded border border-orange-500/20">
                        {exercise.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {exercise.description}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-500">
                        {exercise.equipment}
                      </span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MessageSquare size={14} />
                        <span className="text-xs">{exercise.discussions.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredExercises.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Search size={48} className="mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No exercises found</h3>
              <p className="text-sm text-center mb-4">
                Try adjusting your search terms or filters
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddExerciseForm(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Custom Exercise
                </button>
                <button
                  onClick={() => setShowAISearchModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Discover Exercises
                </button>
              </div>
            </div>
          )}

          {/* Pagination controls */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-4 bg-gray-900 px-4 py-2 rounded">
                <button
                  className={`text-gray-400 hover:text-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => changePage('prev')}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className={`text-gray-400 hover:text-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => changePage('next')}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Search Modal */}
      <AISearchModal
        isOpen={showAISearchModal}
        onClose={() => setShowAISearchModal(false)}
        onAddExercise={addExercise}
      />

      {/* Exercise details modal */}
      {showExerciseDetails && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-5xl max-h-screen overflow-auto border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="bg-orange-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs">⚡</div>
                <h2 className="text-xl font-bold text-white">{selectedExercise.name}</h2>
                {selectedExercise.approved && (
                  <div className="bg-orange-600/20 text-orange-500 px-2 py-0.5 rounded text-xs border border-orange-600/30">
                    Approved
                  </div>
                )}
                {isAISearch && searchMetadata?.isAI && (
                  <div className="bg-orange-600/20 text-orange-500 px-2 py-0.5 rounded text-xs border border-orange-600/30 flex items-center gap-1">
                    <Sparkles size={10} />
                    AI Recommended
                  </div>
                )}
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowExerciseDetails(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column - Image */}
                <div className="md:col-span-1">
                  <div className="relative">
                    <img
                      src={selectedExercise.imageUrl}
                      alt={selectedExercise.name}
                      className="w-full h-64 object-cover rounded-lg opacity-80"
                    />
                  </div>

                  <div className="mt-4">
                    <h3 className="font-medium text-sm text-gray-400 mb-2">TAGS</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-800 text-orange-500 px-3 py-1 rounded-full text-xs border border-orange-500/20">
                        {selectedExercise.muscleGroup}
                      </span>
                      <span className="bg-gray-800 text-orange-500 px-3 py-1 rounded-full text-xs border border-orange-500/20">
                        {selectedExercise.category}
                      </span>
                      <span className="bg-gray-800 text-orange-500 px-3 py-1 rounded-full text-xs border border-orange-500/20">
                        {selectedExercise.difficulty}
                      </span>
                      <span className="bg-gray-800 text-orange-500 px-3 py-1 rounded-full text-xs border border-orange-500/20">
                        {selectedExercise.equipment}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button
                      className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${
                        selectedExercise.approved 
                          ? 'bg-red-900/20 text-red-500 hover:bg-red-900/30 border border-red-500/20' 
                          : 'bg-green-900/20 text-green-500 hover:bg-green-900/30 border border-green-500/20'
                      }`}
                      onClick={() => toggleApproval(selectedExercise.id)}
                    >
                      <CheckCircle size={14} />
                      {selectedExercise.approved ? 'Remove Approval' : 'Approve'}
                    </button>

                    <button
                      className="bg-gray-800 text-orange-500 hover:bg-gray-700 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 border border-orange-500/20"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                  </div>
                </div>

                {/* Right columns - Details */}
                <div className="md:col-span-2">
                  <div>
                    <h3 className="font-medium text-lg mb-3 text-orange-500">Description</h3>
                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                      {selectedExercise.description}
                    </p>

                    <h3 className="font-medium text-gray-400 text-sm mt-5 mb-2">EQUIPMENT</h3>
                    <div className="bg-gray-800/50 p-3 rounded text-sm text-gray-300 border border-gray-700">
                      {selectedExercise.equipment}
                    </div>
                  </div>

                  {/* Discussion section */}
                  <div className="mt-8 pt-4 border-t border-gray-800">
                    <h3 className="font-medium text-lg mb-4 text-orange-500">Discussion ({selectedExercise.discussions.length})</h3>

                    {selectedExercise.discussions.length > 0 ? (
                      <div className="space-y-4 mb-4">
                        {selectedExercise.discussions.map(discussion => (
                          <div key={discussion.id} className="bg-gray-800/50 p-3 rounded border border-gray-700">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-500 text-xs font-bold">
                                  {discussion.user.charAt(0)}
                                </div>
                                <span className="font-medium text-white text-sm">{discussion.user}</span>
                              </div>
                              <span className="text-xs text-gray-500">{discussion.date}</span>
                            </div>
                            <p className="mt-2 text-gray-300 text-sm pl-8">{discussion.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic mb-4 text-sm">No comments yet. Be the first to start a discussion.</p>
                    )}

                    <div className="mt-4">
                      <textarea
                        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded text-white text-sm"
                        placeholder="Add your comment..."
                        rows={2}
                        id="commentBox"
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <button
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-sm"
                          onClick={() => {
                            const commentBox = document.getElementById('commentBox');
                            if (commentBox.value.trim()) {
                              addComment(selectedExercise.id, commentBox.value);
                              commentBox.value = '';
                            }
                          }}
                        >
                          Add Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE Add exercise form */}
      {showAddExerciseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-5xl border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="bg-orange-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs">⚡</div>
                <h2 className="text-xl font-bold text-white">Add New Exercise</h2>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowAddExerciseForm(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newExercise = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  muscleGroup: formData.get('muscleTarget'),
                  category: formData.get('category'),
                  sport: formData.get('sport'),
                  equipment: formData.get('equipment'),
                  difficulty: formData.get('difficulty'),
                  loadType: formData.get('loadType'),
                  executionMode: formData.get('executionMode'),
                  primaryPurpose: formData.get('primaryPurpose'),
                  progressionType: formData.get('progressionType'),
                  accessoryPairing: formData.get('accessoryPairing'),
                  conditioningComponent: formData.get('conditioningComponent') === 'Yes',
                  competitionStandard: formData.get('competitionStandard') === 'Yes',
                  workoutDuration: parseInt(formData.get('workoutDuration')) || null,
                  rounds: parseInt(formData.get('rounds')) || null,
                  tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
                  notes: formData.get('notes'),
                  clientAdjustments: formData.get('clientAdjustments'),
                  imageUrl: '/api/placeholder/400/300'
                };

                // Handle rep range
                if (formData.get('repMin') || formData.get('repMax')) {
                  newExercise.repRange = {
                    min: parseInt(formData.get('repMin')) || 0,
                    max: parseInt(formData.get('repMax')) || 0
                  };
                }

                // Handle rest time
                if (formData.get('restMin') || formData.get('restMax')) {
                  newExercise.restTime = {
                    min: parseInt(formData.get('restMin')) || 0,
                    max: parseInt(formData.get('restMax')) || 0
                  };
                }

                addExercise(newExercise);
              }}>
                {/* Tabs for form sections */}
                <div className="flex border-b border-gray-800 mb-6">
                  <button type="button" className="px-4 py-2 text-orange-500 border-b-2 border-orange-500 font-medium">Basic Info</button>
                  <button type="button" className="px-4 py-2 text-gray-400 hover:text-white">Performance Metrics</button>
                  <button type="button" className="px-4 py-2 text-gray-400 hover:text-white">Workout Parameters</button>
                  <button type="button" className="px-4 py-2 text-gray-400 hover:text-white">Additional Details</button>
                </div>

                {/* Section header */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-orange-500 mb-1">Basic Exercise Information</h3>
                  <p className="text-gray-400 text-sm">Enter the fundamental details about this exercise</p>
                </div>

                {/* First row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Exercise Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Sport
                    </label>
                    <select
                      name="sport"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Sport</option>
                      <option>Powerlifting</option>
                      <option>Weightlifting</option>
                      <option>Bodybuilding</option>
                      <option>CrossFit</option>
                      <option>HYROX</option>
                      <option>Functional Fitness</option>
                      <option>General Strength</option>
                      <option>Sports Performance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Muscle Target*
                    </label>
                    <select
                      name="muscleTarget"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      required
                    >
                      <option value="">Select Muscle Target</option>
                      <optgroup label="Upper Body">
                        <option>Chest</option>
                        <option>Back</option>
                        <option>Shoulders</option>
                        <option>Arms</option>
                      </optgroup>
                      <optgroup label="Lower Body">
                        <option>Legs</option>
                        <option>Glutes</option>
                      </optgroup>
                      <optgroup label="Core">
                        <option>Core</option>
                      </optgroup>
                      <optgroup label="Compound">
                        <option>Full Body</option>
                        <option>Upper Body</option>
                        <option>Lower Body</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Second row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Equipment
                    </label>
                    <select
                      name="equipment"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Equipment</option>
                      <option>Barbell</option>
                      <option>Dumbbell</option>
                      <option>Kettlebell</option>
                      <option>Machine</option>
                      <option>Cable</option>
                      <option>Resistance Band</option>
                      <option>None</option>
                      <option>Medicine Ball</option>
                      <option>Sandbag</option>
                      <option>TRX/Suspension</option>
                      <option>Battle Ropes</option>
                      <option>Slam Ball</option>
                      <option>Box</option>
                      <option>Bench</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Load Type
                    </label>
                    <select
                      name="loadType"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Load Type</option>
                      <option>Free Weight</option>
                      <option>Machine Weight</option>
                      <option>Bodyweight</option>
                      <option>Resistance</option>
                      <option>Variable</option>
                      <option>No Load</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Execution Mode
                    </label>
                    <select
                      name="executionMode"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Execution Mode</option>
                      <option>Concentric</option>
                      <option>Eccentric</option>
                      <option>Isometric</option>
                      <option>Plyometric</option>
                      <option>Ballistic</option>
                      <option>Complex</option>
                    </select>
                  </div>
                </div>

                {/* Third row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Primary Purpose
                    </label>
                    <select
                      name="primaryPurpose"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Primary Purpose</option>
                      <option>Strength</option>
                      <option>Hypertrophy</option>
                      <option>Power</option>
                      <option>Endurance</option>
                      <option>Mobility</option>
                      <option>Stability</option>
                      <option>Conditioning</option>
                      <option>Skill Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Difficulty</option>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Elite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Category</option>
                      <optgroup label="Training Type">
                        <option>Strength</option>
                        <option>Power</option>
                        <option>Hypertrophy</option>
                        <option>Endurance</option>
                        <option>Stability</option>
                        <option>Mobility</option>
                        <option>Flexibility</option>
                        <option>Speed</option>
                        <option>Agility</option>
                        <option>Cardio</option>
                        <option>Recovery</option>
                      </optgroup>
                      <optgroup label="Movement Pattern">
                        <option>Compound</option>
                        <option>Isolation</option>
                        <option>Push</option>
                        <option>Pull</option>
                        <option>Hinge</option>
                        <option>Squat</option>
                        <option>Lunge</option>
                        <option>Carry</option>
                        <option>Rotation</option>
                        <option>Anti-rotation</option>
                      </optgroup>
                      <optgroup label="Execution Style">
                        <option>Concentric Focus</option>
                        <option>Eccentric Focus</option>
                        <option>Isometric/Hold</option>
                        <option>Plyometric</option>
                        <option>Ballistic</option>
                        <option>Quarter Reps</option>
                        <option>Half Reps</option>
                        <option>Full Reps</option>
                        <option>Tempo</option>
                        <option>Explosive</option>
                        <option>Slow & Controlled</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Performance Parameters Section */}
                <div className="mb-6 mt-8 border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-medium text-orange-500 mb-1">Performance Parameters</h3>
                  <p className="text-gray-400 text-sm">Configure tracking and progression settings</p>
                </div>

                {/* Performance row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Repetition Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="repMin"
                        placeholder="Min"
                        min="0"
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      />
                      <input
                        type="number"
                        name="repMax"
                        placeholder="Max"
                        min="0"
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Rest Time (sec)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="restMin"
                        placeholder="Min"
                        min="0"
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      />
                      <input
                        type="number"
                        name="restMax"
                        placeholder="Max"
                        min="0"
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Progression Type
                    </label>
                    <select
                      name="progressionType"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Progression Type</option>
                      <option>Linear Weight</option>
                      <option>Rep Progression</option>
                      <option>Density (more work in same time)</option>
                      <option>Volume (sets x reps)</option>
                      <option>Technique Focus</option>
                      <option>Velocity Based</option>
                      <option>Relative Intensity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Workout Duration (min)
                    </label>
                    <input
                      type="number"
                      name="workoutDuration"
                      min="0"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                </div>

                {/* Additional parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Accessory Pairing
                    </label>
                    <input
                      type="text"
                      name="accessoryPairing"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="e.g., Face Pulls, Band Pull-Aparts"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Conditioning Component
                    </label>
                    <select
                      name="conditioningComponent"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Option</option>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Competition Standard
                    </label>
                    <select
                      name="competitionStandard"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Option</option>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                </div>

                {/* Notes, Tags, Description */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="e.g., compound, legs, beginner-friendly"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Description*
                    </label>
                    <textarea
                      name="description"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      rows={3}
                      required
                      placeholder="Detailed exercise description including proper form and execution..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Notes for Coaches
                    </label>
                    <textarea
                      name="notes"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      rows={2}
                      placeholder="Important notes for coaches when programming this exercise..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Client-Specific Adjustments
                    </label>
                    <textarea
                      name="clientAdjustments"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      rows={2}
                      placeholder="Common modifications or adjustments for different client needs..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-between gap-2 mt-8 pt-6 border-t border-gray-800">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-600 mr-2"></div>
                    <span className="text-white text-sm">* Required fields</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-700 rounded text-gray-300 hover:bg-gray-800"
                      onClick={() => setShowAddExerciseForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save Exercise
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrometheusExerciseLibrary;