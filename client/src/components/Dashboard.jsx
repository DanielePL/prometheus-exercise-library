import React, { useState, useEffect } from 'react';

const Dashboard = ({ exercises, setViewMode }) => {
  // Calculate some basic stats
  const totalExercises = exercises.length;
  const approvedExercises = exercises.filter(ex => ex.approved).length;

  // Group exercises by muscle targets
  const muscleGroups = {};
  exercises.forEach(exercise => {
    if (exercise.muscleTargets && exercise.muscleTargets.length > 0) {
      exercise.muscleTargets.forEach(muscle => {
        if (!muscleGroups[muscle]) {
          muscleGroups[muscle] = 0;
        }
        muscleGroups[muscle]++;
      });
    }
  });

  // Convert to array for display
  const muscleGroupsArray = Object.entries(muscleGroups)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Get top 5

  // Get recent exercises
  const recentExercises = [...exercises]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <div className="flex-1 p-6 overflow-auto bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded flex items-center justify-center text-lg"
            onClick={() => setShowAddExerciseForm(true)}
          >
            <span className="mr-2">➕</span> Add New Exercise
          </button>
          <button
            className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded flex items-center justify-center text-lg"
            onClick={() => setViewMode('library')}
          >
            <span className="mr-2">📚</span> Browse Exercise Library
          </button>
        </div>

        {/* Dashboard widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats widget */}
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <div className="p-3 border-b border-gray-800 bg-gray-950">
              <h3 className="font-bold text-white">Exercise Stats</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-3 rounded text-center">
                  <p className="text-3xl font-bold text-orange-500">{totalExercises}</p>
                  <p className="text-gray-400">Total Exercises</p>
                </div>
                <div className="bg-gray-800 p-3 rounded text-center">
                  <p className="text-3xl font-bold text-green-500">{approvedExercises}</p>
                  <p className="text-gray-400">Approved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top muscle groups widget */}
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <div className="p-3 border-b border-gray-800 bg-gray-950">
              <h3 className="font-bold text-white">Top Muscle Groups</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {muscleGroupsArray.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="bg-indigo-900 text-indigo-200 px-2 py-1 rounded-full text-xs">
                      {item.count} exercises
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent exercises widget */}
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <div className="p-3 border-b border-gray-800 bg-gray-950">
              <h3 className="font-bold text-white">Recently Added</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {recentExercises.map((exercise, index) => (
                  <li key={index} className="bg-gray-800 p-2 rounded">
                    <p className="font-medium text-white">{exercise.name}</p>
                    <div className="flex gap-2 mt-1">
                      {exercise.muscleTargets && exercise.muscleTargets.length > 0 && (
                        <span className="bg-gray-700 text-orange-400 text-xs px-2 py-1 rounded">
                          {exercise.muscleTargets[0]}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;