import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import Register from './Register';
import config from '../../config';

const AuthContainer = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // Set up axios auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token is still valid
      axios.get(`${config.API_URL}/user`)
        .then(() => {
          // Token is valid, user is authenticated
          onAuthSuccess(JSON.parse(user));
        })
        .catch(() => {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [onAuthSuccess]);
  
  const handleLogin = (user) => {
    // Set up axios auth header for future requests
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    onAuthSuccess(user);
  };
  
  const handleRegister = (user) => {
    // Set up axios auth header for future requests
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    onAuthSuccess(user);
  };
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="animate-pulse text-orange-500 text-2xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-4">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl">⚡</div>
          <h1 className="text-3xl font-bold text-white">PROMETHEUS</h1>
        </div>
        <p className="text-gray-400 text-center mt-2">Exercise Library</p>
      </div>
      
      {isLogin ? (
        <Login onLogin={handleLogin} onToggleForm={toggleForm} />
      ) : (
        <Register onRegister={handleRegister} onToggleForm={toggleForm} />
      )}
    </div>
  );
};

export default AuthContainer; 