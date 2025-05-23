import React, { useState, useRef } from 'react';
import { Search, Sparkles, Loader, X, Zap } from 'lucide-react';

const AISearch = ({ exercises, onSearchResults, searchTerm, setSearchTerm }) => {
  const [isAIMode, setIsAIMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  // Sample AI-powered search suggestions
  const aiSuggestions = [
    "chest exercises for beginners",
    "bodyweight exercises for home workout",
    "compound movements for strength",
    "core exercises without equipment",
    "upper body exercises with dumbbells",
    "leg exercises for advanced athletes"
  ];

  // Enhanced search with AI processing
  const performAISearch = async (query) => {
    setIsLoading(true);
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Smart pattern matching (fallback)
      const aiResults = processSearchWithAI(query, exercises);
      onSearchResults(aiResults, query, true);

    } catch (error) {
      console.error('AI Search error:', error);
      performRegularSearch(query);
    } finally {
      setIsLoading(false);
    }
  };

  // AI-enhanced search processing
  const processSearchWithAI = (query, exerciseList) => {
    const lowercaseQuery = query.toLowerCase();

    const patterns = {
      muscleGroups: {
        chest: ['chest', 'pecs', 'pectoral'],
        back: ['back', 'lats', 'latissimus'],
        legs: ['legs', 'quads', 'hamstrings', 'glutes'],
        shoulders: ['shoulders', 'delts'],
        arms: ['arms', 'biceps', 'triceps'],
        core: ['core', 'abs', 'abdominals']
      },
      difficulty: {
        beginner: ['beginner', 'easy', 'starter'],
        intermediate: ['intermediate', 'medium'],
        advanced: ['advanced', 'hard', 'expert']
      }
    };

    let results = [...exerciseList];
    let searchScore = {};

    results.forEach(exercise => {
      searchScore[exercise.id] = 0;
    });

    // Analyze query for muscle groups
    Object.entries(patterns.muscleGroups).forEach(([muscle, keywords]) => {
      if (keywords.some(keyword => lowercaseQuery.includes(keyword))) {
        results.forEach(exercise => {
          if (exercise.muscleGroup.toLowerCase().includes(muscle)) {
            searchScore[exercise.id] += 10;
          }
        });
      }
    });

    // Analyze query for difficulty
    Object.entries(patterns.difficulty).forEach(([level, keywords]) => {
      if (keywords.some(keyword => lowercaseQuery.includes(keyword))) {
        results.forEach(exercise => {
          if (exercise.difficulty.toLowerCase() === level) {
            searchScore[exercise.id] += 8;
          }
        });
      }
    });

    // Text similarity in name and description
    results.forEach(exercise => {
      const queryWords = lowercaseQuery.split(' ');

      queryWords.forEach(word => {
        if (word.length > 2) {
          if (exercise.name.toLowerCase().includes(word)) {
            searchScore[exercise.id] += 5;
          }
          if (exercise.description.toLowerCase().includes(word)) {
            searchScore[exercise.id] += 2;
          }
        }
      });
    });

    return results
      .filter(exercise => searchScore[exercise.id] > 0)
      .sort((a, b) => searchScore[b.id] - searchScore[a.id]);
  };

  // Regular search fallback
  const performRegularSearch = (query) => {
    const results = exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(query.toLowerCase()) ||
      exercise.description.toLowerCase().includes(query.toLowerCase())
    );
    onSearchResults(results, query, false);
  };

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setShowSuggestions(false);

    if (isAIMode) {
      await performAISearch(searchTerm);
    } else {
      performRegularSearch(searchTerm);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      setSuggestions(aiSuggestions.slice(0, 4));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    if (isAIMode) {
      performAISearch(suggestion);
    } else {
      performRegularSearch(suggestion);
    }
  };

  return (
    <div className="relative mb-4" ref={searchInputRef}>
      {/* Search Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          <Search size={16} className="text-orange-500" />
          <span className="text-sm font-medium text-orange-500">Search</span>
        </div>

        {/* AI Mode Toggle */}
        <button
          onClick={() => setIsAIMode(!isAIMode)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
            isAIMode 
              ? 'bg-orange-600/20 text-orange-500 border border-orange-500/30' 
              : 'bg-gray-800 text-gray-400 hover:text-orange-500 border border-gray-700'
          }`}
        >
          {isAIMode ? <Sparkles size={12} /> : <Zap size={12} />}
          AI
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder={isAIMode ? "Try: 'chest exercises for beginners'" : "Search exercises..."}
            className={`w-full p-2 pl-8 pr-10 bg-gray-800 border rounded text-white text-sm transition-colors ${
              isAIMode 
                ? 'border-orange-500/50 focus:border-orange-500' 
                : 'border-gray-700 focus:border-gray-600'
            } focus:outline-none`}
            value={searchTerm}
            onChange={handleInputChange}
          />

          {/* Search Icon */}
          <div className="absolute left-2 top-2.5">
            {isLoading ? (
              <Loader size={14} className="text-orange-500 animate-spin" />
            ) : (
              <Search size={14} className={isAIMode ? 'text-orange-500' : 'text-gray-500'} />
            )}
          </div>

          {/* Clear Button */}
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setShowSuggestions(false);
                onSearchResults(exercises, '', false);
              }}
              className="absolute right-2 top-2.5 text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* AI Mode Indicator */}
        {isAIMode && (
          <div className="flex items-center gap-1 mt-1">
            <Sparkles size={10} className="text-orange-500" />
            <span className="text-xs text-orange-500">AI-powered search enabled</span>
          </div>
        )}
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-md mt-1 z-50 shadow-lg">
          <div className="p-2">
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              {isAIMode && <Sparkles size={10} />}
              Suggestions
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="block w-full text-left px-2 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISearch;