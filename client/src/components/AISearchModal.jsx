import React, { useState, useRef } from 'react';
import { Search, Sparkles, X, Loader, Globe, Dumbbell, Users, Target, Zap, Plus, BookOpen, Play, Check, Clock, Trash2 } from 'lucide-react';

const AISearchModal = ({ isOpen, onClose, onAddExercise }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('exercise');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    difficulty: '',
    equipment: '',
    muscle: '',
    sport: ''
  });

  // New state for exercise management
  const [pendingExercises, setPendingExercises] = useState(new Set());
  const [approvedExercises, setApprovedExercises] = useState(new Set());
  const [rejectedExercises, setRejectedExercises] = useState(new Set());

  const modalRef = useRef(null);

  // Search categories
  const searchTypes = [
    { id: 'exercise', label: 'Exercises', icon: Dumbbell, color: 'orange' },
    { id: 'workout', label: 'Workouts', icon: Target, color: 'blue' },
    { id: 'equipment', label: 'Equipment', icon: Zap, color: 'green' },
    { id: 'muscle', label: 'Muscle Groups', icon: Users, color: 'purple' },
    { id: 'sport', label: 'Sports', icon: Play, color: 'red' }
  ];

  // Filter options
  const filterOptions = {
    difficulty: ['Beginner', 'Intermediate', 'Advanced', 'Elite'],
    equipment: ['Bodyweight', 'Dumbbells', 'Barbell', 'Kettlebell', 'Machine', 'Cable', 'Resistance Bands', 'None'],
    muscle: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body'],
    sport: ['Powerlifting', 'Bodybuilding', 'CrossFit', 'Calisthenics', 'Yoga', 'Pilates', 'Running', 'Swimming']
  };

  // Simulate AI-powered web search with OpenAI
  const performAIWebSearch = async () => {
    setIsLoading(true);

    try {
      // Construct search prompt based on type and filters
      const searchPrompt = buildSearchPrompt();

      // Call OpenAI API to get exercise recommendations
      const aiResponse = await callOpenAIForExercises(searchPrompt);

      // Process and display results with unique IDs
      const exercisesWithIds = (aiResponse.exercises || []).map((exercise, index) => ({
        ...exercise,
        searchId: `search_${Date.now()}_${index}` // Unique identifier for this search session
      }));

      setSearchResults(exercisesWithIds);

      // Clear previous states for new search
      setPendingExercises(new Set());
      setApprovedExercises(new Set());
      setRejectedExercises(new Set());

    } catch (error) {
      console.error('AI Web Search error:', error);
      // Fallback to mock data for demo
      const mockResults = getMockSearchResults().map((exercise, index) => ({
        ...exercise,
        searchId: `mock_${Date.now()}_${index}`
      }));
      setSearchResults(mockResults);

      // Clear previous states
      setPendingExercises(new Set());
      setApprovedExercises(new Set());
      setRejectedExercises(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  // Build search prompt for OpenAI
  const buildSearchPrompt = () => {
    let prompt = `Find ${searchType}s for: "${searchQuery}"`;

    if (selectedFilters.difficulty) prompt += ` | Difficulty: ${selectedFilters.difficulty}`;
    if (selectedFilters.equipment) prompt += ` | Equipment: ${selectedFilters.equipment}`;
    if (selectedFilters.muscle) prompt += ` | Target: ${selectedFilters.muscle}`;
    if (selectedFilters.sport) prompt += ` | Sport: ${selectedFilters.sport}`;

    return prompt;
  };

  // Call OpenAI API for exercise discovery
  const callOpenAIForExercises = async (prompt) => {
    const systemPrompt = `You are a world-class fitness expert and exercise database. Your job is to discover and recommend exercises, workouts, and fitness content from across the internet and fitness literature.

When asked about exercises or workouts, provide detailed, accurate information including:
- Exercise name and variations
- Detailed step-by-step instructions
- Target muscle groups
- Required equipment
- Difficulty level
- Safety considerations
- Common mistakes to avoid
- Progression and regression options

Return your response as a JSON object with this structure:
{
  "exercises": [
    {
      "name": "Exercise Name",
      "description": "Detailed step-by-step instructions",
      "muscleGroup": "Primary muscle group",
      "category": "Exercise category",
      "difficulty": "Beginner/Intermediate/Advanced",
      "equipment": "Required equipment",
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "tips": ["Tip 1", "Tip 2"],
      "variations": ["Variation 1", "Variation 2"],
      "safetyNotes": "Important safety considerations",
      "source": "Source or reference"
    }
  ]
}

Provide 5-8 high-quality, diverse exercises that match the request.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content;

      try {
        return JSON.parse(content);
      } catch {
        return {
          exercises: [{
            name: "AI Search Result",
            description: content.substring(0, 200) + "...",
            muscleGroup: selectedFilters.muscle || "General",
            category: searchType,
            difficulty: selectedFilters.difficulty || "Intermediate",
            equipment: selectedFilters.equipment || "Various",
            instructions: ["AI-generated content"],
            tips: ["Generated from AI"],
            variations: [],
            safetyNotes: "Follow proper form",
            source: "OpenAI GPT-4"
          }]
        };
      }
    } catch (error) {
      throw error;
    }
  };

  // Mock search results for demo (when OpenAI is not available)
  const getMockSearchResults = () => {
    const mockExercises = [
      {
        name: "Bulgarian Split Squat Variations",
        description: "A unilateral leg exercise that targets quads, glutes, and improves balance. Perform with rear foot elevated on bench.",
        muscleGroup: "Legs",
        category: "Compound",
        difficulty: "Intermediate",
        equipment: "Bench, Optional Dumbbells",
        instructions: [
          "Stand 2-3 feet in front of a bench",
          "Place top of one foot on bench behind you",
          "Lower body until front thigh is parallel to floor",
          "Push through front heel to return to start"
        ],
        tips: ["Keep torso upright", "Don't let front knee cave inward"],
        variations: ["Weighted Bulgarian Split Squat", "Jumping Bulgarian Split Squat"],
        safetyNotes: "Start bodyweight only, ensure proper balance",
        source: "Strength & Conditioning Research"
      },
      {
        name: "Nordic Hamstring Curls",
        description: "Advanced eccentric hamstring exercise proven to reduce injury risk and build posterior chain strength.",
        muscleGroup: "Legs",
        category: "Eccentric",
        difficulty: "Advanced",
        equipment: "Partner or Anchor Point",
        instructions: [
          "Kneel with feet anchored",
          "Slowly lower body forward",
          "Control descent with hamstrings",
          "Use hands to push back to start"
        ],
        tips: ["Focus on slow eccentric phase", "Build up gradually"],
        variations: ["Assisted Nordic Curls", "Single Leg Nordic"],
        safetyNotes: "Very demanding - start with assistance",
        source: "FIFA 11+ Program"
      },
      {
        name: "Turkish Get-Up",
        description: "Full-body movement combining mobility, stability, and strength. Excellent for functional fitness.",
        muscleGroup: "Full Body",
        category: "Functional",
        difficulty: "Intermediate",
        equipment: "Kettlebell or Dumbbell",
        instructions: [
          "Lie down with weight in right hand",
          "Roll to elbow, then to hand",
          "Bridge up and sweep leg under",
          "Stand up, reverse to return"
        ],
        tips: ["Keep eyes on weight", "Move slowly and controlled"],
        variations: ["Bodyweight Get-Up", "Heavy Turkish Get-Up"],
        safetyNotes: "Learn movement pattern without weight first",
        source: "StrongFirst Methodology"
      },
      // Add more exercises based on search filters
      {
        name: "Goblet Squat",
        description: "The goblet squat is a lower body exercise that primarily targets the quads, glutes, and hamstrings.",
        muscleGroup: "Legs",
        category: "Compound",
        difficulty: "Beginner",
        equipment: "Dumbbell or Kettlebell",
        instructions: [
          "Hold weight close to chest",
          "Stand with feet shoulder-width apart",
          "Lower into squat position",
          "Drive through heels to stand"
        ],
        tips: ["Keep chest up", "Don't let knees cave in"],
        variations: ["Single Arm Goblet Squat", "Goblet Squat to Press"],
        safetyNotes: "Great for beginners learning squat pattern",
        source: "Functional Movement Systems"
      }
    ];

    // Filter based on search criteria
    return mockExercises.filter(exercise => {
      const matchesQuery = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = !selectedFilters.difficulty || exercise.difficulty === selectedFilters.difficulty;
      const matchesMuscle = !selectedFilters.muscle || exercise.muscleGroup.includes(selectedFilters.muscle);

      return matchesQuery && matchesDifficulty && matchesMuscle;
    });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    performAIWebSearch();
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? '' : value
    }));
  };

  // Enhanced exercise management functions
  const handleAddToPending = (exercise) => {
    setPendingExercises(prev => new Set([...prev, exercise.searchId]));
    setRejectedExercises(prev => {
      const newSet = new Set(prev);
      newSet.delete(exercise.searchId);
      return newSet;
    });
  };

  const handleApproveExercise = (exercise) => {
    // Add to library
    const newExercise = {
      name: exercise.name,
      description: exercise.description,
      muscleGroup: exercise.muscleGroup,
      category: exercise.category,
      difficulty: exercise.difficulty,
      equipment: exercise.equipment,
      instructions: exercise.instructions,
      tips: exercise.tips,
      variations: exercise.variations,
      safetyNotes: exercise.safetyNotes,
      source: exercise.source,
      approved: true, // Auto-approve AI-discovered exercises
      addedFrom: 'AI Discovery'
    };

    onAddExercise(newExercise);

    // Update states
    setApprovedExercises(prev => new Set([...prev, exercise.searchId]));
    setPendingExercises(prev => {
      const newSet = new Set(prev);
      newSet.delete(exercise.searchId);
      return newSet;
    });

    // Remove from search results after a brief delay to show approval
    setTimeout(() => {
      setSearchResults(prev => prev.filter(ex => ex.searchId !== exercise.searchId));
    }, 1500);
  };

  const handleRejectExercise = (exercise) => {
    setRejectedExercises(prev => new Set([...prev, exercise.searchId]));
    setPendingExercises(prev => {
      const newSet = new Set(prev);
      newSet.delete(exercise.searchId);
      return newSet;
    });

    // Remove from search results after a brief delay
    setTimeout(() => {
      setSearchResults(prev => prev.filter(ex => ex.searchId !== exercise.searchId));
    }, 1000);
  };

  const getExerciseStatus = (exercise) => {
    if (approvedExercises.has(exercise.searchId)) return 'approved';
    if (rejectedExercises.has(exercise.searchId)) return 'rejected';
    if (pendingExercises.has(exercise.searchId)) return 'pending';
    return 'none';
  };

  // Reset modal state when closing
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setPendingExercises(new Set());
    setApprovedExercises(new Set());
    setRejectedExercises(new Set());
    setSelectedFilters({ difficulty: '', equipment: '', muscle: '', sport: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-orange-600/20 to-purple-600/20">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Exercise Discovery</h2>
              <p className="text-gray-300 text-sm">Search the internet for exercises, workouts & training methods</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Search & Filters */}
          <div className="w-80 bg-gray-800 p-6 border-r border-gray-700 overflow-y-auto">

            {/* Search Types */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Globe size={16} />
                Search Category
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {searchTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSearchType(type.id)}
                      className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                        searchType === type.id
                          ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Icon size={16} className="mx-auto mb-1" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Search Query
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search for ${searchType}s...`}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 pr-12"
                />
                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded text-white transition-colors"
                >
                  {isLoading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>
            </form>

            {/* Filters */}
            <div className="space-y-4">
              {Object.entries(filterOptions).map(([filterType, options]) => (
                <div key={filterType}>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2 capitalize">{filterType}</h4>
                  <div className="flex flex-wrap gap-1">
                    {options.map(option => (
                      <button
                        key={option}
                        onClick={() => handleFilterChange(filterType, option)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedFilters[filterType] === option
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Filters */}
            {Object.values(selectedFilters).some(filter => filter) && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Active Filters</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(selectedFilters).map(([type, value]) =>
                    value && (
                      <span
                        key={type}
                        className="px-2 py-1 bg-orange-600/20 text-orange-400 rounded text-xs flex items-center gap-1"
                      >
                        {value}
                        <button
                          onClick={() => handleFilterChange(type, value)}
                          className="hover:text-orange-300"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Search Stats */}
            {searchResults.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Session Stats</h4>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Found:</span>
                      <span className="text-white">{searchResults.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="text-yellow-400">{pendingExercises.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Added:</span>
                      <span className="text-green-400">{approvedExercises.size}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Sparkles size={48} className="animate-pulse text-orange-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">AI is searching the web...</h3>
                <p className="text-sm">Finding the best {searchType}s for "{searchQuery}"</p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchResults.length === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Search size={48} className="mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-sm">Try different search terms or adjust your filters</p>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && searchResults.length > 0 && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    Found {searchResults.length} {searchType}s for "{searchQuery}"
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Sparkles size={16} className="text-orange-500" />
                    AI-powered web search
                  </div>
                </div>

                <div className="space-y-4">
                  {searchResults.map((exercise, index) => {
                    const status = getExerciseStatus(exercise);

                    return (
                      <div
                        key={exercise.searchId}
                        className={`bg-gray-800 rounded-lg border p-6 transition-all duration-300 ${
                          status === 'approved' ? 'border-green-500 bg-green-900/10' :
                          status === 'rejected' ? 'border-red-500 bg-red-900/10 opacity-50' :
                          status === 'pending' ? 'border-yellow-500 bg-yellow-900/10' :
                          'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                              {exercise.name}
                              {status === 'approved' && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                                  <Check size={12} />
                                  Added to Library
                                </span>
                              )}
                              {status === 'pending' && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs">
                                  <Clock size={12} />
                                  Review Pending
                                </span>
                              )}
                            </h4>
                            <p className="text-gray-300 text-sm mb-3">{exercise.description}</p>

                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="px-2 py-1 bg-orange-600/20 text-orange-400 rounded text-xs">
                                {exercise.muscleGroup}
                              </span>
                              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                                {exercise.difficulty}
                              </span>
                              <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                                {exercise.equipment}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {status === 'none' && (
                              <>
                                <button
                                  onClick={() => handleAddToPending(exercise)}
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                  <Clock size={14} />
                                  Review
                                </button>
                                <button
                                  onClick={() => handleApproveExercise(exercise)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                  <Plus size={14} />
                                  Add Now
                                </button>
                              </>
                            )}

                            {status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveExercise(exercise)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                  <Check size={14} />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectExercise(exercise)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                  <Trash2 size={14} />
                                  Reject
                                </button>
                              </>
                            )}

                            {status === 'approved' && (
                              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 rounded text-sm">
                                <Check size={14} />
                                Added
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Instructions */}
                        {exercise.instructions && exercise.instructions.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">Instructions</h5>
                            <ol className="list-decimal list-inside space-y-1">
                              {exercise.instructions.map((step, i) => (
                                <li key={i} className="text-gray-400 text-sm">{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Tips & Variations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {exercise.tips && exercise.tips.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-300 mb-1">Tips</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {exercise.tips.map((tip, i) => (
                                  <li key={i} className="text-gray-400">{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {exercise.variations && exercise.variations.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-300 mb-1">Variations</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {exercise.variations.map((variation, i) => (
                                  <li key={i} className="text-gray-400">{variation}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Source */}
                        {exercise.source && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-xs text-gray-500">Source: {exercise.source}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Welcome State */}
            {!searchQuery && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                <div className="bg-gradient-to-br from-orange-600/20 to-purple-600/20 p-8 rounded-2xl border border-gray-700 max-w-md text-center">
                  <BookOpen size={48} className="mx-auto mb-4 text-orange-500" />
                  <h3 className="text-lg font-medium mb-2 text-white">Discover New Exercises</h3>
                  <p className="text-sm mb-4">Search the entire internet for exercises, workouts, and training methods. Review and add the best ones to your library.</p>
                  <div className="text-xs text-gray-500">
                    Try searching for: "functional movements", "core stability", "explosive training"
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISearchModal;