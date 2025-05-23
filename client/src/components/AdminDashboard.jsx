import React from 'react';
import { useNavigate } from 'react-router-dom';
import PrometheusExerciseLibrary from './ExerciseLibrary';
function AdminDashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with logout */}
      <nav className="bg-gray-900 shadow-md p-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 text-white w-8 h-8 rounded flex items-center justify-center text-xl">⚡</div>
            <h1 className="text-xl font-bold text-white">PROMETHEUS EXERCISE LIBRARY</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Exercise Library - No extra padding since it handles its own layout */}
      <div style={{ height: 'calc(100vh - 80px)' }}> {/* Subtract header height */}
        <PrometheusExerciseLibrary />
      </div>
    </div>
  );
}

export default AdminDashboard;