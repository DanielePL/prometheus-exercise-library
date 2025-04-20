import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';

const Login = ({ onLogin, onToggleForm }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${config.API_URL}/login`, formData);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Call the onLogin callback
      onLogin(response.data.user);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Login to Prometheus</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded border border-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-orange-500"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-orange-500"
            placeholder="Enter your password"
            value={formData.password}
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
      
      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <button 
            onClick={onToggleForm} 
            className="text-orange-500 hover:text-orange-400 focus:outline-none"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login; 