// src/pages/AdminDashboard.jsx
import React from 'react';
import ImportExercises from '../components/ImportExercises';

const AdminDashboard = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      <header className="bg-black text-white p-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 text-white w-8 h-8 rounded flex items-center justify-center text-xl">⚡</div>
            <h1 className="text-xl font-bold">PROMETHEUS ADMIN</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImportExercises />

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Statistics</h2>
            {/* Add statistics about your exercise library */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;