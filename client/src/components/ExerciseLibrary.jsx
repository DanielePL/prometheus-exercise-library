import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import config from '../config';

// API client functions with proper config
const API_URL = config.API_URL;

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 60000; // 60 second timeout for API calls

// Add a response interceptor for better error handling
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    return Promise.reject(error);
  }
);

const getExercises = async (filters = {}) => {
  const { muscleGroup, category, search } = filters;
  const params = {};

  if (muscleGroup && muscleGroup !== 'All') params.muscleGroup = muscleGroup;
  if (category && category !== 'All') params.category = category;
  if (search) params.search = search;

  const response = await axios.get(`${API_URL}/exercises`, { params });
  return response.data;
};

const createExercise = async (exerciseData) => {
  const response = await axios.post(`${API_URL}/exercises`, exerciseData);
  return response.data;
};

const updateExercise = async (id, exerciseData) => {
  const response = await axios.put(`${API_URL}/exercises/${id}`, exerciseData);
  return response.data;
};

// New API function for deleting exercises
const deleteExercise = async (id) => {
  const response = await axios.delete(`${API_URL}/exercises/${id}`);
  return response.data;
};

// Main component
export default function ExerciseLibrary({ user, onLogout }) {
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
  const [loading, setLoading] = useState(true);
  const exercisesPerPage = 9;

  // State for workout search
  const [showWorkoutSearchModal, setShowWorkoutSearchModal] = useState(false);
  const [workoutType, setWorkoutType] = useState('crossfit');
  const [workoutSearchTerm, setWorkoutSearchTerm] = useState('');
  const [workoutSearchResults, setWorkoutSearchResults] = useState([]);
  const [workoutSearchLoading, setWorkoutSearchLoading] = useState(false);

  // State for AI search
  const [showAiSearchModal, setShowAiSearchModal] = useState(false);
  const [aiSearchTerm, setAiSearchTerm] = useState('');
  const [aiSearchResults, setAiSearchResults] = useState([]);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  // State for saved workouts
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [workoutSearchText, setWorkoutSearchText] = useState('');
  const [selectedWorkoutCategory, setSelectedWorkoutCategory] = useState('All');
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  // View mode state (dashboard, library, or workouts)
  const [viewMode, setViewMode] = useState('dashboard');

  // State for duplicate handling
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [duplicateExercises, setDuplicateExercises] = useState([]);
  const [isDeletingExercise, setIsDeletingExercise] = useState(false);
  const [showEditExerciseForm, setShowEditExerciseForm] = useState(false);

  // New state for video playback
  const [playingVideo, setPlayingVideo] = useState(null);

  // Utility functions for video handling
  // Enhanced YouTube URL detection functions - replace the current ones
const getYouTubeThumbnail = (url) => {
  if (!url) return null;

  // Log the URL for debugging
  console.log('Getting thumbnail for URL:', url);

  // Extract YouTube video ID from different possible URL formats
  let videoId = null;

  // Standard youtube.com/watch?v= format
  const standardRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const standardMatch = url.match(standardRegExp);

  if (standardMatch && standardMatch[2].length === 11) {
    videoId = standardMatch[2];
  }

  // youtu.be/ short format
  const shortRegExp = /^.*((youtu.be\/)([^#&?]*))/;
  const shortMatch = url.match(shortRegExp);

  if (!videoId && shortMatch && shortMatch[3] && shortMatch[3].length === 11) {
    videoId = shortMatch[3];
  }

  // youtube.com/embed/ format
  const embedRegExp = /^.*(youtube.com\/embed\/)([^#&?]*).*/;
  const embedMatch = url.match(embedRegExp);

  if (!videoId && embedMatch && embedMatch[2] && embedMatch[2].length === 11) {
    videoId = embedMatch[2];
  }

  if (videoId) {
    console.log('YouTube video ID extracted:', videoId);
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  console.log('Could not extract YouTube video ID from URL');
  return null;
};

  const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;

  // Log the URL for debugging
  console.log('Getting embed URL for:', url);

  // Extract YouTube video ID using the same logic as above
  let videoId = null;

  // Standard youtube.com/watch?v= format
  const standardRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const standardMatch = url.match(standardRegExp);

  if (standardMatch && standardMatch[2].length === 11) {
    videoId = standardMatch[2];
  }

  // youtu.be/ short format
  const shortRegExp = /^.*((youtu.be\/)([^#&?]*))/;
  const shortMatch = url.match(shortRegExp);

  if (!videoId && shortMatch && shortMatch[3] && shortMatch[3].length === 11) {
    videoId = shortMatch[3];
  }

  // youtube.com/embed/ format
  const embedRegExp = /^.*(youtube.com\/embed\/)([^#&?]*).*/;
  const embedMatch = url.match(embedRegExp);

  if (!videoId && embedMatch && embedMatch[2] && embedMatch[2].length === 11) {
    videoId = embedMatch[2];
  }

  if (videoId) {
    console.log('YouTube video ID extracted for embed:', videoId);
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  console.log('Could not extract YouTube video ID for embed URL');
  return null;
};

  // Fetch exercises from API
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const data = await getExercises();
        setExercises(data);
        setFilteredExercises(data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Fetch saved workouts
  useEffect(() => {
    const fetchSavedWorkouts = async () => {
      try {
        setLoadingWorkouts(true);
        const response = await axios.get(`${API_URL}/workouts`);
        setSavedWorkouts(response.data);
        setFilteredWorkouts(response.data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoadingWorkouts(false);
      }
    };

    fetchSavedWorkouts();
  }, []);

  // Apply filters
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setLoading(true);
        const data = await getExercises({
          muscleGroup: selectedMuscleGroup,
          category: selectedCategory,
          search: searchTerm
        });
        setFilteredExercises(data);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add debounce for search input
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedMuscleGroup, selectedCategory]);

  // Filter workouts based on search and category
  useEffect(() => {
    if (savedWorkouts.length === 0) return;
    
    const filtered = savedWorkouts.filter(workout => {
      const matchesSearch = workoutSearchText === '' || 
        workout.name.toLowerCase().includes(workoutSearchText.toLowerCase()) ||
        (workout.description && workout.description.toLowerCase().includes(workoutSearchText.toLowerCase()));
      
      const matchesCategory = selectedWorkoutCategory === 'All' || 
        workout.category === selectedWorkoutCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredWorkouts(filtered);
  }, [workoutSearchText, selectedWorkoutCategory, savedWorkouts]);

  // Add new exercise
  const addExercise = async (newExercise) => {
    try {
      const createdExercise = await createExercise(newExercise);
      setExercises([...exercises, createdExercise]);
      setFilteredExercises([...filteredExercises, createdExercise]);
      setShowAddExerciseForm(false);

      // Optional: Show a success message
      alert(`Exercise "${newExercise.name}" has been added to your library!`);

      // Optional: Remove the added exercise from AI search results
      setAiSearchResults(aiSearchResults.filter(ex => ex.name !== newExercise.name));
    } catch (error) {
      console.error('Error adding exercise:', error);
      alert('Failed to add exercise. Please try again.');
    }
  };

  // Edit exercise
  const handleEditExercise = (exercise) => {
    setSelectedExercise(exercise);
    setShowEditExerciseForm(true);
  };

  // Update existing exercise
  const updateExistingExercise = async (exerciseId, updatedData) => {
    try {
      const updatedExercise = await updateExercise(exerciseId, updatedData);

      // Update exercises state
      setExercises(exercises.map(ex => ex._id === exerciseId ? updatedExercise : ex));
      setFilteredExercises(filteredExercises.map(ex => ex._id === exerciseId ? updatedExercise : ex));

      // Update selected exercise if it's currently being viewed
      if (selectedExercise && selectedExercise._id === exerciseId) {
        setSelectedExercise(updatedExercise);
      }

      setShowEditExerciseForm(false);
      alert('Exercise updated successfully!');
    } catch (error) {
      console.error('Error updating exercise:', error);
      alert('Failed to update exercise. Please try again.');
    }
  };

  // Add comment to exercise
  const addComment = async (exerciseId, comment) => {
    try {
      const exercise = exercises.find(ex => ex._id === exerciseId);
      if (!exercise) return;

      const updatedExercise = {
        ...exercise,
        discussions: [
          ...exercise.discussions || [],
          {
            id: (exercise.discussions?.length || 0) + 1,
            user: 'Current Coach',
            text: comment,
            date: new Date().toISOString().split('T')[0]
          }
        ]
      };

      await updateExercise(exerciseId, updatedExercise);

      setExercises(exercises.map(ex => ex._id === exerciseId ? updatedExercise : ex));

      if (selectedExercise && selectedExercise._id === exerciseId) {
        setSelectedExercise(updatedExercise);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Function to find duplicate exercises
  const handleFindDuplicates = () => {
    const names = {};
    const duplicates = [];

    exercises.forEach(exercise => {
      const name = exercise.name.toLowerCase().trim();
      if (!names[name]) {
        names[name] = [exercise];
      } else {
        names[name].push(exercise);
      }
    });

    // Extract duplicate groups
    Object.values(names).forEach(group => {
      if (group.length > 1) {
        duplicates.push(group);
      }
    });

    setDuplicateExercises(duplicates);
    setShowDuplicatesModal(true);
  };

  // Handle deleting an exercise
  const handleDeleteExercise = async (id) => {
    try {
      setIsDeletingExercise(true);
      await deleteExercise(id);

      // Update local state
      const updatedExercises = exercises.filter(ex => ex._id !== id);
      setExercises(updatedExercises);
      setFilteredExercises(filteredExercises.filter(ex => ex._id !== id));

      // Close details modal if this exercise is being viewed
      if (selectedExercise && (selectedExercise._id === id || selectedExercise.id === id)) {
        setShowExerciseDetails(false);
      }

      // Update duplicate list
      setDuplicateExercises(
        duplicateExercises.map(group =>
          group.filter(ex => ex._id !== id)
        ).filter(group => group.length > 1)
      );

      alert('Exercise deleted successfully');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise');
    } finally {
      setIsDeletingExercise(false);
    }
  };

  // Toggle approval status
  const toggleApproval = async (exerciseId) => {
    try {
      const exercise = exercises.find(ex => ex._id === exerciseId);
      if (!exercise) return;

      const updatedExercise = {
        ...exercise,
        approved: !exercise.approved
      };

      await updateExercise(exerciseId, updatedExercise);

      setExercises(exercises.map(ex => ex._id === exerciseId ? updatedExercise : ex));

      if (selectedExercise && selectedExercise._id === exerciseId) {
        setSelectedExercise(updatedExercise);
      }
    } catch (error) {
      console.error('Error toggling approval:', error);
    }
  };

  // Add these with your other handler functions
const handleWorkoutSearch = async () => {
  // Allow empty search terms by not validating here
  setWorkoutSearchLoading(true);
  try {
    console.log("Searching for workouts:", workoutSearchTerm || "general", "Type:", workoutType);
    
    const response = await axios.post(`${API_URL}/ai-workout-search`, {
      searchTerm: workoutSearchTerm || workoutType, // Use workout type as fallback if no search term
      workoutType: workoutType
    });

    console.log("Workout search response:", response.data);

    if (response.data.success) {
      if (response.data.workouts && response.data.workouts.length > 0) {
        setWorkoutSearchResults(response.data.workouts);
      } else {
        setWorkoutSearchResults([]);
        alert("No workouts found. Please try different search terms.");
      }
    } else {
      console.error("Error from workout search API:", response.data.error);
      // Still use fallback workouts if provided
      if (response.data.workouts && response.data.workouts.length > 0) {
        setWorkoutSearchResults(response.data.workouts);
      } else {
        setWorkoutSearchResults([]);
        alert("Failed to find workouts. Please try different search terms.");
      }
    }
  } catch (error) {
    console.error("Error searching for workouts:", error);
    setWorkoutSearchResults([]);
    alert(`An error occurred while searching for workouts: ${error.message}`);
  } finally {
    setWorkoutSearchLoading(false);
  }
};

const saveWorkout = async (workout) => {
  try {
    console.log("Saving workout:", workout);
    const response = await axios.post(`${API_URL}/workouts`, {
      ...workout,
      category: workoutType.charAt(0).toUpperCase() + workoutType.slice(1),
      source: 'AI Generated'
    });

    if (response.data.success) {
      alert(`Workout "${workout.name}" saved to library!`);
      
      // Update the workout list with the newly saved workout
      setSavedWorkouts([response.data.workout, ...savedWorkouts]);
      
      // If the current view is workouts and the category filter matches, also update filtered workouts
      if (viewMode === 'workouts' && 
          (selectedWorkoutCategory === 'All' || 
           selectedWorkoutCategory === workoutType.charAt(0).toUpperCase() + workoutType.slice(1))) {
        setFilteredWorkouts([response.data.workout, ...filteredWorkouts]);
      }
      
      // Close the search modal
      setShowWorkoutSearchModal(false);
    } else {
      console.error("Error from server:", response.data.error);
      alert(`Failed to save workout: ${response.data.error}`);
    }
  } catch (error) {
    console.error("Error saving workout:", error);
    const errorMessage = error.response?.data?.error || error.message;
    alert(`Failed to save workout: ${errorMessage}`);
  }
};

  // AI search function
  const searchExercisesWithAI = async (searchTerm) => {
    try {
      setAiSearchLoading(true);

      // Call to your backend which would then call the AI API
      const response = await axios.post(`${API_URL}/ai-search`, { searchTerm });

      setAiSearchResults(response.data.exercises);
      return response.data.exercises;
    } catch (error) {
      console.error('Error searching exercises with AI:', error);
      return [];
    } finally {
      setAiSearchLoading(false);
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

  // Handle deleting a workout
  const handleDeleteWorkout = async (id) => {
    try {
      if (!window.confirm('Are you sure you want to delete this workout?')) {
        return;
      }
      
      await axios.delete(`${API_URL}/workouts/${id}`);
      
      // Update local state
      setSavedWorkouts(savedWorkouts.filter(workout => workout._id !== id));
      setFilteredWorkouts(filteredWorkouts.filter(workout => workout._id !== id));
      
      alert('Workout deleted successfully');
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
    }
  };

  // Render the exercise library
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black text-white p-4 border-b border-gray-800">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 text-white w-8 h-8 rounded flex items-center justify-center text-xl">⚡</div>
            <h1 className="text-xl font-bold">PROMETHEUS EXERCISE LIBRARY</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle buttons */}
            <button
              className={`mr-4 px-3 py-1 rounded ${viewMode === 'dashboard' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
              onClick={() => setViewMode('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`mr-4 px-3 py-1 rounded ${viewMode === 'library' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
              onClick={() => setViewMode('library')}
            >
              Exercise Library
            </button>
            <button
              className={`mr-4 px-3 py-1 rounded ${viewMode === 'workouts' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
              onClick={() => setViewMode('workouts')}
            >
              Workout Library
            </button>

            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
              onClick={() => setShowWorkoutSearchModal(true)}
            >
              🏋️ AI Workout Search
            </button>

            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2"
              onClick={() => setShowAiSearchModal(true)}
            >
              🤖 AI Exercise Search
            </button>
            <button
              className="bg-gray-800 hover:bg-gray-700 text-orange-500 px-4 py-2 rounded border border-orange-500/20"
              onClick={() => setShowImportForm(true)}
            >
              📄 Import Excel
            </button>
            <button
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
              onClick={() => setShowAddExerciseForm(true)}
            >
              + Add Exercise
            </button>
            
            {/* User Profile and Logout */}
            <div className="ml-4 flex items-center">
              <div className="relative group">
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-full">
                  <span className="text-white">{user?.username || 'User'}</span>
                  <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 p-1 hidden group-hover:block z-10">
                  <div className="py-1">
                    <p className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                      Signed in as <span className="font-medium text-white">{user?.username}</span>
                    </p>
                    <button
                      onClick={onLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content - conditionally render based on viewMode */}
      {viewMode === 'dashboard' ? (
        <Dashboard
          exercises={exercises}
          setViewMode={setViewMode}
          setShowAddExerciseForm={setShowAddExerciseForm}
          setShowAiSearchModal={setShowAiSearchModal}
          onFindDuplicates={handleFindDuplicates}
        />
      ) : viewMode === 'library' ? (
        /* Library view */
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900 p-4 flex flex-col">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search exercises..."
                  className="w-full p-2 pl-8 bg-gray-800 border border-gray-700 rounded text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-2 top-2.5 text-gray-500">🔍</span>
              </div>
            </div>

            {/* Muscle Group filter */}
            <div className="mb-4">
              <h3 className="font-medium mb-2 text-orange-500">Muscle Group</h3>
              <select
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              >
                <option value="All">All Muscle Groups</option>
                <optgroup label="Upper Body">
                  <option value="Neck">Neck</option>
                  <option value="Traps (Trapezius)">Traps (Trapezius)</option>
                  <option value="Shoulders (Deltoids)">Shoulders (Deltoids)</option>
                  <option value="Chest (Pectoralis)">Chest (Pectoralis)</option>
                  <option value="Back (Latissimus Dorsi)">Back (Latissimus Dorsi)</option>
                  <option value="Back (Rhomboids)">Back (Rhomboids)</option>
                  <option value="Back (Erector Spinae)">Back (Erector Spinae)</option>
                  <option value="Biceps (Biceps Brachii)">Biceps (Biceps Brachii)</option>
                  <option value="Triceps (Triceps Brachii)">Triceps (Triceps Brachii)</option>
                  <option value="Forearms">Forearms</option>
                </optgroup>
                <optgroup label="Core">
                  <option value="Abdominals (Rectus Abdominis)">Abdominals (Rectus Abdominis)</option>
                  <option value="Obliques">Obliques</option>
                  <option value="Lower Back (Erector Spinae)">Lower Back (Erector Spinae)</option>
                </optgroup>
                <optgroup label="Lower Body">
                  <option value="Quadriceps">Quadriceps</option>
                  <option value="Hamstrings">Hamstrings</option>
                  <option value="Glutes">Glutes</option>
                  <option value="Hip Flexors">Hip Flexors</option>
                  <option value="Calves (Gastrocnemius)">Calves (Gastrocnemius)</option>
                  <option value="Calves (Soleus)">Calves (Soleus)</option>
                </optgroup>
                <optgroup label="Compound">
                  <option value="Full Body">Full Body</option>
                  <option value="Upper Body">Upper Body</option>
                  <option value="Lower Body">Lower Body</option>
                  <option value="Push (Chest/Shoulders/Triceps)">Push (Chest/Shoulders/Triceps)</option>
                  <option value="Pull (Back/Biceps)">Pull (Back/Biceps)</option>
                  <option value="Legs (Quads/Hamstrings/Glutes)">Legs (Quads/Hamstrings/Glutes)</option>
                </optgroup>
              </select>
            </div>

            {/* Category filter */}
            <div className="mb-4">
              <h3 className="font-medium mb-2 text-orange-500">Category</h3>
              <select
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All</option>
                <optgroup label="Training Type">
                  <option value="Strength">Strength</option>
                  <option value="Power">Power</option>
                  <option value="Hypertrophy">Hypertrophy</option>
                  <option value="Endurance">Endurance</option>
                  <option value="Stability">Stability</option>
                  <option value="Mobility">Mobility</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Speed">Speed</option>
                  <option value="Agility">Agility</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Recovery">Recovery</option>
                </optgroup>
              </select>
            </div>

            {/* Find Duplicates Button */}
            <div className="mb-4">
              <button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded flex items-center justify-center gap-2"
                onClick={handleFindDuplicates}
              >
                🔍 Find & Manage Duplicates
              </button>
            </div>

            {/* Stats */}
            <div className="mt-4 bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-400">
                {filteredExercises.length} exercises found
              </p>
              <p className="text-sm text-gray-400">
                {exercises.filter(ex => ex.approved).length} approved / {exercises.length} total
              </p>
            </div>
          </div>

          {/* Exercise list */}
          <div className="flex-1 p-4 overflow-auto bg-gray-950">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-orange-500">Loading exercises...</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                  {currentExercises.length > 0 ? (
                    currentExercises.map(exercise => (
                      <div
                        key={exercise._id || exercise.id}
                        className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors border border-gray-800"
                        onClick={() => openExerciseDetails(exercise)}
                      >
                        <div className="h-48 bg-gray-800 relative">
                          <img
                            src={
                              (exercise.videoUrl && getYouTubeThumbnail(exercise.videoUrl)) ||
                              exercise.imageUrl ||
                              'https://via.placeholder.com/400x300'
                            }
                            alt={exercise.name}
                            className="w-full h-full object-cover opacity-80"
                          />
                          {exercise.approved && (
                            <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded text-xs">
                              Approved
                            </div>
                          )}

                          {/* Delete button overlay */}
                          <div className="absolute top-2 left-2 z-10">
                            <button
                              className="bg-red-800 text-white rounded-full p-1 opacity-70 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent opening exercise details
                                if (window.confirm(`Are you sure you want to delete "${exercise.name}"?`)) {
                                  handleDeleteExercise(exercise._id || exercise.id);
                                }
                              }}
                            >
                              🗑️
                            </button>
                          </div>

                          {/* Video play button overlay */}
                          {exercise.videoUrl && (
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent opening exercise details
                                setPlayingVideo(exercise.videoUrl);
                              }}
                            >
                              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                                <span className="text-white text-2xl">▶️</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg">{exercise.name}</h3>
                          <div className="flex gap-2 mt-1">
                            {exercise.muscleTargets && exercise.muscleTargets.length > 0 && (
                              <span className="bg-gray-800 text-orange-500 text-xs px-2 py-1 rounded border border-orange-500/20">
                                {exercise.muscleTargets[0]}
                              </span>
                            )}
                            {exercise.sport && (
                              <span className="bg-gray-800 text-orange-500 text-xs px-2 py-1 rounded border border-orange-500/20">
                                {exercise.sport}
                              </span>
                            )}
                            {exercise.videoUrl && (
                              <span className="bg-red-900 text-red-300 text-xs px-2 py-1 rounded border border-red-500/20">
                                Video
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                            {exercise.description || 'No description available'}
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-gray-500">
                              {exercise.equipment ? (
                                Array.isArray(exercise.equipment) ?
                                  exercise.equipment.join(', ') :
                                  exercise.equipment
                              ) : 'No equipment'}
                            </span>
                            <div className="flex items-center gap-1 text-gray-500">
                              <span>💬</span>
                              <span className="text-xs">{(exercise.discussions || []).length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center text-gray-500 py-12">
                      No exercises found. Try adjusting your filters or add a new exercise.
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex items-center gap-4 bg-gray-900 px-4 py-2 rounded">
                      <button
                        className={`text-gray-400 hover:text-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => changePage('prev')}
                        disabled={currentPage === 1}
                      >
                        ◀
                      </button>
                      <span className="text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className={`text-gray-400 hover:text-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => changePage('next')}
                        disabled={currentPage === totalPages}
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Workout library view */
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900 p-4 flex flex-col">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search workouts..."
                  className="w-full p-2 pl-8 bg-gray-800 border border-gray-700 rounded text-white"
                  value={workoutSearchText}
                  onChange={(e) => setWorkoutSearchText(e.target.value)}
                />
                <span className="absolute left-2 top-2.5 text-gray-500">🔍</span>
              </div>
            </div>

            {/* Category filter */}
            <div className="mb-4">
              <h3 className="font-medium mb-2 text-orange-500">Category</h3>
              <select
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                value={selectedWorkoutCategory}
                onChange={(e) => setSelectedWorkoutCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="CrossFit">CrossFit</option>
                <option value="Strength">Strength Training</option>
                <option value="HIIT">HIIT</option>
                <option value="Bodybuilding">Bodybuilding</option>
                <option value="Powerlifting">Powerlifting</option>
                <option value="Weightlifting">Olympic Weightlifting</option>
                <option value="Hyrox">Hyrox</option>
                <option value="Endurance">Endurance</option>
                <option value="Functional">Functional Training</option>
              </select>
            </div>

            {/* AI Workout Search button */}
            <div className="mb-4">
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded flex items-center justify-center gap-2"
                onClick={() => setShowWorkoutSearchModal(true)}
              >
                🏋️ AI Workout Search
              </button>
            </div>

            {/* Stats */}
            <div className="mt-4 bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-400">
                {filteredWorkouts.length} workouts found
              </p>
            </div>
          </div>

          {/* Workout list */}
          <div className="flex-1 p-4 overflow-auto bg-gray-950">
            {loadingWorkouts ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-purple-500">Loading workouts...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                {filteredWorkouts.length > 0 ? (
                  filteredWorkouts.map(workout => (
                    <div key={workout._id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-white">{workout.name}</h3>
                        <div>
                          <button
                            className="bg-red-800 text-white rounded-full p-1 opacity-70 hover:opacity-100"
                            onClick={() => handleDeleteWorkout(workout._id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{workout.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-gray-800 text-purple-500 text-xs px-2 py-1 rounded border border-purple-500/20">
                          {workout.category}
                        </span>
                        <span className="bg-gray-800 text-blue-500 text-xs px-2 py-1 rounded border border-blue-500/20">
                          {workout.type || 'Custom'}
                        </span>
                        {workout.difficulty && (
                          <span className="bg-gray-800 text-orange-500 text-xs px-2 py-1 rounded border border-orange-500/20">
                            {workout.difficulty}
                          </span>
                        )}
                        {workout.estimatedTime && (
                          <span className="bg-gray-800 text-green-500 text-xs px-2 py-1 rounded border border-green-500/20">
                            {workout.estimatedTime}
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-white mb-2">Exercises:</h4>
                        <ul className="space-y-2">
                          {workout.exercises && workout.exercises.map((exercise, index) => (
                            <li key={index} className="bg-gray-800 p-2 rounded">
                              <span className="font-medium text-white">{exercise.name}</span>
                              <div className="text-sm text-gray-400">
                                {exercise.sets && exercise.sets !== "AMRAP" && <span>Sets: {exercise.sets} </span>}
                                {exercise.reps && <span>× {exercise.reps} </span>}
                                {exercise.weight && <span>@ {exercise.weight} </span>}
                                {exercise.distance && <span>Distance: {exercise.distance} </span>}
                                {exercise.duration && <span>Duration: {exercise.duration}</span>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {workout.scalingOptions && workout.scalingOptions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-white mb-2">Scaling Options:</h4>
                          <ul className="text-sm text-gray-400">
                            {workout.scalingOptions.map((option, index) => (
                              <li key={index} className="mb-1">
                                <span className="text-gray-300">{option.level}:</span> {option.modifications}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-4">
                        Source: {workout.source || 'Custom'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-gray-500 py-12">
                    No workouts found. Try adjusting your filters or use AI Workout Search to create new workouts.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exercise details modal */}
      {showExerciseDetails && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-screen overflow-auto border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">{selectedExercise.name}</h2>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowExerciseDetails(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={
                      (selectedExercise.videoUrl && getYouTubeThumbnail(selectedExercise.videoUrl)) ||
                      selectedExercise.imageUrl ||
                      'https://via.placeholder.com/400x300'
                    }
                    alt={selectedExercise.name}
                    className="w-full h-64 object-cover rounded-lg opacity-80"
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedExercise.muscleTargets && selectedExercise.muscleTargets.map((target, index) => (
                      <span key={index} className="bg-gray-800 text-orange-500 px-3 py-1 rounded-full text-sm border border-orange-500/20">
                        {target}
                      </span>
                    ))}
                    {selectedExercise.sport && (
                      <span className="bg-gray-800 text-orange-500 px-3 py-1 rounded-full text-sm border border-orange-500/20">
                        {selectedExercise.sport}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2 text-orange-500">Description</h3>
                  <p className="text-gray-300 mb-4">
                    {selectedExercise.description || 'No description available'}
                  </p>

                  {/* Video play button */}
                  {selectedExercise.videoUrl && (
                    <div className="mt-4 mb-4">
                      <button
                        onClick={() => setPlayingVideo(selectedExercise.videoUrl)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 w-fit"
                      >
                        <span>▶️</span> Play Video Tutorial
                      </button>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      className={`px-4 py-2 rounded flex items-center gap-2 ${
                        selectedExercise.approved 
                          ? 'bg-red-900/20 text-red-500 hover:bg-red-900/30 border border-red-500/20' 
                          : 'bg-green-900/20 text-green-500 hover:bg-green-900/30 border border-green-500/20'
                      }`}
                      onClick={() => toggleApproval(selectedExercise._id || selectedExercise.id)}
                    >
                      {selectedExercise.approved ? '✓ Remove Approval' : '✓ Approve Exercise'}
                    </button>

                    <button
                      className="bg-gray-800 text-orange-500 hover:bg-gray-700 px-4 py-2 rounded flex items-center gap-2 border border-orange-500/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditExercise(selectedExercise);
                      }}
                    >
                      ✎ Edit Exercise
                    </button>

                    {/* Delete button */}
                    <button
                      className="bg-red-800 text-white hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 border border-red-500/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${selectedExercise.name}"?`)) {
                          handleDeleteExercise(selectedExercise._id || selectedExercise.id);
                          setShowExerciseDetails(false);
                        }
                      }}
                    >
                      🗑️ Delete Exercise
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-medium text-lg mb-4 text-orange-500">Discussion ({(selectedExercise.discussions || []).length})</h3>

                {selectedExercise.discussions && selectedExercise.discussions.length > 0 ? (
                  <div className="space-y-4 mb-4">
                    {selectedExercise.discussions.map((discussion, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded border border-gray-700">
                        <div className="flex justify-between">
                          <span className="font-medium text-white">{discussion.user}</span>
                          <span className="text-sm text-gray-500">{discussion.date}</span>
                        </div>
                        <p className="mt-2 text-gray-300">{discussion.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic mb-4">No comments yet. Be the first to start a discussion.</p>
                )}

                <div className="mt-4">
                  <textarea
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="Add your comment..."
                    rows={3}
                    id="commentBox"
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
                      onClick={() => {
                        const commentBox = document.getElementById('commentBox');
                        if (commentBox.value.trim()) {
                          addComment(selectedExercise._id || selectedExercise.id, commentBox.value);
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
      )}

      {/* Add exercise form modal */}
      {showAddExerciseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Add New Exercise</h2>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowAddExerciseForm(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newExercise = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  muscleTargets: formData.get('muscleTarget') ? [formData.get('muscleTarget')] : [],
                  sport: formData.get('sport'),
                  equipment: formData.get('equipment') ? formData.get('equipment').split(',').map(e => e.trim()) : [],
                  videoUrl: formData.get('videoUrl'),
                  imageUrl: 'https://via.placeholder.com/400x300'
                };
                addExercise(newExercise);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                      Muscle Target*
                    </label>
                    <select
                      name="muscleTarget"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      required
                    >
                      <option value="">Select Muscle Target</option>
                      <optgroup label="Upper Body">
                        <option value="Neck">Neck</option>
                        <option value="Traps (Trapezius)">Traps (Trapezius)</option>
                        <option value="Shoulders (Deltoids)">Shoulders (Deltoids)</option>
                        <option value="Chest (Pectoralis)">Chest (Pectoralis)</option>
                        <option value="Back (Latissimus Dorsi)">Back (Latissimus Dorsi)</option>
                        <option value="Back (Rhomboids)">Back (Rhomboids)</option>
                        <option value="Back (Erector Spinae)">Back (Erector Spinae)</option>
                        <option value="Biceps (Biceps Brachii)">Biceps (Biceps Brachii)</option>
                        <option value="Triceps (Triceps Brachii)">Triceps (Triceps Brachii)</option>
                        <option value="Forearms">Forearms</option>
                      </optgroup>
                      <optgroup label="Core">
                        <option value="Abdominals (Rectus Abdominis)">Abdominals (Rectus Abdominis)</option>
                        <option value="Obliques">Obliques</option>
                        <option value="Lower Back (Erector Spinae)">Lower Back (Erector Spinae)</option>
                      </optgroup>
                      <optgroup label="Lower Body">
                        <option value="Quadriceps">Quadriceps</option>
                        <option value="Hamstrings">Hamstrings</option>
                        <option value="Glutes">Glutes</option>
                        <option value="Hip Flexors">Hip Flexors</option>
                        <option value="Calves (Gastrocnemius)">Calves (Gastrocnemius)</option>
                        <option value="Calves (Soleus)">Calves (Soleus)</option>
                      </optgroup>
                      <optgroup label="Compound">
                        <option value="Full Body">Full Body</option>
                        <option value="Upper Body">Upper Body</option>
                        <option value="Lower Body">Lower Body</option>
                        <option value="Push (Chest/Shoulders/Triceps)">Push (Chest/Shoulders/Triceps)</option>
                        <option value="Pull (Back/Biceps)">Pull (Back/Biceps)</option>
                        <option value="Legs (Quads/Hamstrings/Glutes)">Legs (Quads/Hamstrings/Glutes)</option>
                      </optgroup>
                    </select>
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
                      <option value="Powerlifting">Powerlifting</option>
                      <option value="Bodybuilding">Bodybuilding</option>
                      <option value="CrossFit">CrossFit</option>
                      <option value="Weightlifting">Weightlifting</option>
                      <option value="Hyrox">Other</option>
                      <option value="General Fitness">General Fitness</option>
                      <option value="Tennis">General Fitness</option>
                      <option value="Gymnastics">Gymnastics</option>
                      <option value="Boxing">Boxing</option>
                      <option value="Golf">Yoga</option>
                      <option value="Triathlon">Aerobics</option>
                      <option value="Marathon">Zumba</option>
                      <option value="Track n' Field">Pilates</option>
                      <option value="Football">Spinning</option>
                      <option value="Hockey">Tai Chi</option>
                      <option value="Paddel">Kettlebell</option>

                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Equipment
                    </label>
                    <input
                      type="text"
                      name="equipment"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="e.g., Barbell, Dumbbell, None"
                    />
                  </div>

                  {/* Video Tutorial URL field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Video Tutorial URL
                    </label>
                    <input
                      type="text"
                      name="videoUrl"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="e.g., https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description*
                  </label>
                  <textarea
                    name="description"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    rows={4}
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 mt-6">
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
                    💾 Save Exercise
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Exercise Search modal */}
      {showAiSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">AI Exercise Search</h2>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowAiSearchModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Search for exercises by name, muscle group, or equipment. Our AI will find relevant exercises from the internet.
              </p>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="E.g., 'bench press', 'quad exercises', 'dumbbell workouts'..."
                  className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  value={aiSearchTerm}
                  onChange={(e) => setAiSearchTerm(e.target.value)}
                />
                <button
                  disabled={!aiSearchTerm.trim() || aiSearchLoading}
                  className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded ${(!aiSearchTerm.trim() || aiSearchLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => searchExercisesWithAI(aiSearchTerm)}
                >
                  {aiSearchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {aiSearchResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Results ({aiSearchResults.length})</h3>
                  <div className="max-h-96 overflow-y-auto pr-2">
                    {aiSearchResults.map((exercise, index) => (
                      <div key={index} className="bg-gray-800 rounded p-3 mb-3 border border-gray-700">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-white">{exercise.name}</h4>
                          <button
                            className="text-indigo-400 hover:text-indigo-300 text-sm"
                            onClick={() => addExercise(exercise)}
                          >
                            + Add to Library
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm mt-1">{exercise.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {exercise.muscleTargets && exercise.muscleTargets.map((target, i) => (
                            <span key={i} className="bg-gray-700 text-indigo-300 text-xs px-2 py-1 rounded">
                              {target}
                            </span>
                          ))}
                          {exercise.equipment && (
                            <span className="bg-gray-700 text-orange-300 text-xs px-2 py-1 rounded">
                              {exercise.equipment}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiSearchLoading && (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <p className="mt-2 text-indigo-400">Searching for exercises...</p>
                </div>
              )}

              {!aiSearchLoading && aiSearchResults.length === 0 && aiSearchTerm && (
                <div className="text-center py-10 text-gray-400">
                  No exercises found. Try a different search term.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Excel form modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Import Exercises from Excel</h2>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowImportForm(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {/* Import form content */}
              <p className="text-gray-300 mb-4">
                Upload an Excel file containing exercise data.
              </p>
              {/* Import form would go here */}
            </div>
          </div>
        </div>
      )}

      {/* Edit exercise form modal */}
      {showEditExerciseForm && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[60]">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Edit Exercise</h2>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowEditExerciseForm(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedExercise = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  muscleTargets: formData.get('muscleTarget') ? [formData.get('muscleTarget')] : [],
                  sport: formData.get('sport'),
                  equipment: formData.get('equipment') ? formData.get('equipment').split(',').map(e => e.trim()) : [],
                  videoUrl: formData.get('videoUrl'),
                  imageUrl: selectedExercise.imageUrl || 'https://via.placeholder.com/400x300'
                };
                updateExistingExercise(selectedExercise._id, updatedExercise);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Exercise Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedExercise.name}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Muscle Target*
                    </label>
                    <select
                      name="muscleTarget"
                      defaultValue={selectedExercise.muscleTargets && selectedExercise.muscleTargets[0]}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      required
                    >
                      <option value="">Select Muscle Target</option>
                      <optgroup label="Upper Body">
                        <option value="Neck">Neck</option>
                        <option value="Traps (Trapezius)">Traps (Trapezius)</option>
                        <option value="Shoulders (Deltoids)">Shoulders (Deltoids)</option>
                        <option value="Chest (Pectoralis)">Chest (Pectoralis)</option>
                        <option value="Back (Latissimus Dorsi)">Back (Latissimus Dorsi)</option>
                        <option value="Back (Rhomboids)">Back (Rhomboids)</option>
                        <option value="Back (Erector Spinae)">Back (Erector Spinae)</option>
                        <option value="Biceps (Biceps Brachii)">Biceps (Biceps Brachii)</option>
                        <option value="Triceps (Triceps Brachii)">Triceps (Triceps Brachii)</option>
                        <option value="Forearms">Forearms</option>
                      </optgroup>
                      <optgroup label="Core">
                        <option value="Abdominals (Rectus Abdominis)">Abdominals (Rectus Abdominis)</option>
                        <option value="Obliques">Obliques</option>
                        <option value="Lower Back (Erector Spinae)">Lower Back (Erector Spinae)</option>
                      </optgroup>
                      <optgroup label="Lower Body">
                        <option value="Quadriceps">Quadriceps</option>
                        <option value="Hamstrings">Hamstrings</option>
                        <option value="Glutes">Glutes</option>
                        <option value="Hip Flexors">Hip Flexors</option>
                        <option value="Calves (Gastrocnemius)">Calves (Gastrocnemius)</option>
                        <option value="Calves (Soleus)">Calves (Soleus)</option>
                      </optgroup>
                      <optgroup label="Compound">
                        <option value="Full Body">Full Body</option>
                        <option value="Upper Body">Upper Body</option>
                        <option value="Lower Body">Lower Body</option>
                        <option value="Push (Chest/Shoulders/Triceps)">Push (Chest/Shoulders/Triceps)</option>
                        <option value="Pull (Back/Biceps)">Pull (Back/Biceps)</option>
                        <option value="Legs (Quads/Hamstrings/Glutes)">Legs (Quads/Hamstrings/Glutes)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Sport
                    </label>
                    <select
                      name="sport"
                      defaultValue={selectedExercise.sport}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Sport</option>
                      <option value="Powerlifting">Powerlifting</option>
                      <option value="Bodybuilding">Bodybuilding</option>
                      <option value="CrossFit">CrossFit</option>
                      <option value="Weightlifting">Weightlifting</option>
                      <option value="Hyrox">Hyrox</option>
                      <option value="General Fitness">General Fitness</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Gymnastics">Gymnastics</option>
                      <option value="Martial Arts">Martial Arts</option>
                      <option value="Golf">Golf</option>
                      <option value="Triathlon">Triathlon</option>
                      <option value="Basketball">Marathon</option>
                      <option value="Track & Field">Track & Field</option>
                      <option value="Football">Spinning</option>
                      <option value="Hockey">Tai Chi</option>
                      <option value="Paddel">Kettlebell</option>
                      <option value="Running">Running</option>
                     <option value="Volleyball">Volleyball</option>
                      <option value="Table Tennis">Table Tennis</option>
                      <option value="Baseball">Baseball</option>
                      <option value="Cycling">Cycling</option>
                      <option value="Skiing">Skiing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Equipment
                    </label>
                    <input
                      type="text"
                      name="equipment"
                      defaultValue={selectedExercise.equipment ? (Array.isArray(selectedExercise.equipment) ? selectedExercise.equipment.join(', ') : selectedExercise.equipment) : ''}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="e.g., Barbell, Dumbbell, None"
                    />
                  </div>

                  {/* Video Tutorial URL field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Video Tutorial URL
                    </label>
                    <input
                      type="text"
                      name="videoUrl"
                      defaultValue={selectedExercise.videoUrl}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="e.g., https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description*
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedExercise.description}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    rows={4}
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-700 rounded text-gray-300 hover:bg-gray-800"
                    onClick={() => setShowEditExerciseForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    💾 Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Duplicates management modal */}
      {showDuplicatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-screen overflow-auto border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Manage Duplicate Exercises</h2>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowDuplicatesModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {duplicateExercises.length > 0 ? (
                <>
                  <p className="text-gray-300 mb-4">
                    Found {duplicateExercises.length} groups of duplicate exercises. Review and delete as needed.
                  </p>

                  <div className="space-y-6">
                    {duplicateExercises.map((group, groupIndex) => (
                      <div key={groupIndex} className="bg-gray-800 p-4 rounded border border-gray-700">
                        <h3 className="font-bold text-white mb-2">{group[0].name}</h3>

                        <div className="space-y-3">
                          {group.map((exercise, exIndex) => (
                            <div key={exIndex} className="flex justify-between items-center bg-gray-900 p-3 rounded">
                              <div>
                                <p className="text-white">ID: {exercise._id}</p>
                                <p className="text-gray-400 text-sm">
                                  {exercise.muscleTargets && exercise.muscleTargets.length > 0 ? `Targets: ${exercise.muscleTargets.join(', ')}` : 'No targets specified'}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {exercise.approved ? 'Approved' : 'Not Approved'}
                                </p>
                              </div>
                              <button
                                className="bg-red-900 hover:bg-red-800 text-white px-3 py-1 rounded"
                                onClick={() => handleDeleteExercise(exercise._id)}
                                disabled={isDeletingExercise}
                              >
                                {isDeletingExercise ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-400 py-10">
                  No duplicate exercises found!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Workout Search Modal - ADDING IT HERE */}
      {showWorkoutSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Find Workouts</h2>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowWorkoutSearchModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Search for workouts by type and keywords. Our AI will suggest relevant workouts.
              </p>

              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Workout Type
                  </label>
                  <select
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value)}
                  >
                    <option value="crossfit">CrossFit</option>
                    <option value="strength">Strength Training</option>
                    <option value="hiit">HIIT</option>
                    <option value="bodybuilding">Bodybuilding</option>
                    <option value="powerlifting">Powerlifting</option>
                    <option value="weightlifting">Olympic Weightlifting</option>
                    <option value="hyrox">Hyrox</option>
                    <option value="endurance">Endurance</option>
                    <option value="functional">Functional Training</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Search Terms
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="E.g., 'beginner', 'upper body', 'quick'"
                      className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      value={workoutSearchTerm}
                      onChange={(e) => setWorkoutSearchTerm(e.target.value)}
                    />
                    <button
                      className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded ${(workoutSearchLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={handleWorkoutSearch}
                      disabled={workoutSearchLoading}
                    >
                      {workoutSearchLoading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
              </div>

              {workoutSearchResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Results ({workoutSearchResults.length})</h3>
                  <div className="max-h-96 overflow-y-auto pr-2">
                    {workoutSearchResults.map((workout, index) => (
                      <div key={index} className="bg-gray-800 rounded p-4 mb-3 border border-gray-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-white text-lg">{workout.name}</h4>
                            <p className="text-gray-300 text-sm mt-1">{workout.description}</p>
                          </div>
                          <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                            onClick={() => saveWorkout(workout)}
                          >
                            Save Workout
                          </button>
                        </div>

                        <div className="mt-3">
                          <h5 className="font-medium text-orange-500 text-sm mb-2">Exercises:</h5>
                          <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                            {workout.exercises.map((exercise, i) => (
                              <li key={i}>
                                <span className="font-medium">{exercise.name}</span>
                                {exercise.sets && exercise.sets !== "AMRAP" && <span> - {exercise.sets} sets</span>}
                                {exercise.reps && <span> × {exercise.reps}</span>}
                                {exercise.weight && <span> @ {exercise.weight}</span>}
                                {exercise.distance && <span> - {exercise.distance}</span>}
                                {exercise.duration && <span> - {exercise.duration}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="bg-gray-700 text-indigo-300 text-xs px-2 py-1 rounded">
                            {workout.difficulty || 'Intermediate'}
                          </span>
                          <span className="bg-gray-700 text-orange-300 text-xs px-2 py-1 rounded">
                            {workout.duration || workout.estimatedTime || '30-45 min'}
                          </span>
                          <span className="bg-gray-700 text-green-300 text-xs px-2 py-1 rounded">
                            {workout.type || workoutType.charAt(0).toUpperCase() + workoutType.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {workoutSearchLoading && (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <p className="mt-2 text-indigo-400">Searching for workouts...</p>
                </div>
              )}

              {!workoutSearchLoading && workoutSearchResults.length === 0 && workoutSearchTerm && (
                <div className="text-center py-10 text-gray-400">
                  No workouts found. Try different search terms.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[70]">
          <div className="w-full max-w-4xl max-h-[90vh] bg-black rounded-lg overflow-hidden relative">
            <button
              className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full z-10 hover:bg-gray-700"
              onClick={() => setPlayingVideo(null)}
            >
              ✕
            </button>

            <div className="aspect-video w-full">
              {getYouTubeEmbedUrl(playingVideo) ? (
                <iframe
                  src={getYouTubeEmbedUrl(playingVideo)}
                  className="w-full h-full border-0"
                  title="Video Tutorial"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <a
                    href={playingVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded text-lg"
                  >
                    Open Video in New Tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}