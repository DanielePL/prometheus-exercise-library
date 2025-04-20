// client/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/App.css';             // Von src-Ordner aus
import './styles/index.css';  //
import ExerciseLibrary from './components/ExerciseLibrary';  // Von src-Ordner aus
import AuthContainer from './components/Auth/AuthContainer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Handle login/registration success
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <ExerciseLibrary user={user} onLogout={handleLogout} />
      ) : (
        <AuthContainer onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;