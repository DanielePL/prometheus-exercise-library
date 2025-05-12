import React, { useState } from 'react';
import axios from 'axios';
import CONFIG from '../../config'; // Pfad anpassen je nach Dateistruktur

const LoginForm = () => {
  const [formData, setFormData] = useState({
    password1: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Fehler zurücksetzen, wenn Benutzer etwas ändert
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Verwendung der richtigen Feldnamen entsprechend dem Backend
      const response = await axios.post(`${CONFIG.API_URL}/api/login`, { 
        username: formData.password1, 
        password: formData.password2 
      });
      
      console.log('Login response:', response.data); // Debug-Info
      
      // Token und Benutzerinformationen im localStorage speichern
      localStorage.setItem('token', response.data.token);
      
      // Benutzerinformationen speichern, falls verfügbar
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        // Fallback, falls keine Benutzerinformationen zurückgegeben werden
        localStorage.setItem('user', JSON.stringify({
          id: 'admin-id',
          username: 'Admin',
          role: 'admin'
        }));
      }
      
      localStorage.setItem('isLoggedIn', 'true');
      
      // Zur Hauptseite weiterleiten
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
      
      // Detaillierte Fehlermeldung, falls verfügbar
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Login fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-4">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl">⚡</div>
          <h1 className="text-3xl font-bold text-white">PROMETHEUS</h1>
        </div>
        <p className="text-gray-400 text-center mt-2">Exercise Library</p>
      </div>
      
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login to Prometheus</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded border border-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="password1">
              Password 1
            </label>
            <input
              type="password"
              id="password1"
              name="password1"
              className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-orange-500"
              placeholder="Enter Password 1"
              value={formData.password1}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="password2">
              Password 2
            </label>
            <input
              type="password"
              id="password2"
              name="password2"
              className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-orange-500"
              placeholder="Enter Password 2"
              value={formData.password2}
              onChange={handleChange}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;