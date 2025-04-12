import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API client functions
const API_URL = 'http://localhost:5000/api';

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

// Main component
export default function ExerciseLibrary() {
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

  // Add new exercise
  const addExercise = async (newExercise) => {
    try {
      const createdExercise = await createExercise(newExercise);
      setExercises([...exercises, createdExercise]);
      setFilteredExercises([...filteredExercises, createdExercise]);
      setShowAddExerciseForm(false);
    } catch (error) {
      console.error('Error adding exercise:', error);
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
          <button
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center gap-2"
            onClick={() => setShowAddExerciseForm(true)}
          >
            + Add Exercise
          </button>
        </div>
      </header>

      {/* Main content */}
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
              <option value="Chest">Chest</option>
              <option value="Back">Back</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Arms">Arms</option>
              <option value="Legs">Legs</option>
              <option value="Core">Core</option>
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
              <option value="Strength">Strength</option>
              <option value="Bodyweight">Bodyweight</option>
              <option value="Compound">Compound</option>
              <option value="Isolation">Isolation</option>
              <option value="Isometric">Isometric</option>
            </select>
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
                          src={exercise.imageUrl || 'https://via.placeholder.com/400x300'}
                          alt={exercise.name}
                          className="w-full h-full object-cover opacity-80"
                        />
                        {exercise.approved && (
                          <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded text-xs">
                            Approved
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

      {/* Exercise details modal - only shown when showExerciseDetails is true */}
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
                    src={selectedExercise.imageUrl || 'https://via.placeholder.com/400x300'}
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

                  <div className="mt-6 flex gap-2">
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
                    >
                      ✎ Edit Exercise
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

      {/* Add exercise form modal - only shown when showAddExerciseForm is true */}
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
                      <option value="Chest">Chest</option>
                      <option value="Back">Back</option>
                      <option value="Shoulders">Shoulders</option>
                      <option value="Biceps">Biceps</option>
                      <option value="Triceps">Triceps</option>
                      <option value="Legs">Legs</option>
                      <option value="Core">Core</option>
                      <option value="Full Body">Full Body</option>
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
                      <option value="General Fitness">General Fitness</option>
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
    </div>
  );
}