// client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import './index.css'; // oder die entsprechende CSS-Datei

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Prüfe Auth-Status beim Laden
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ?
              <Navigate to="/admin" /> :
              <Login setIsAuthenticated={setIsAuthenticated} />
          } />
          <Route
            path="/admin"
            element={
              isAuthenticated ?
                <AdminDashboard setIsAuthenticated={setIsAuthenticated} /> :
                <Navigate to="/login" />
            }
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/admin" : "/login"} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;