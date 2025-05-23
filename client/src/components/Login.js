// client/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setIsAuthenticated }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Statische Passwörter für Teammitglieder
  const validPasswords = ['Kraft', 'Vision'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validPasswords.includes(password)) {
      // Login erfolgreich
      localStorage.setItem('authToken', 'team-authenticated');
      setIsAuthenticated(true);
      navigate('/admin');
    } else {
      // Falsches Passwort
      setError('Ungültiges Passwort. Bitte versuche es erneut.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Team Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Team-Passwort
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              required
                autoComplete="current-password"
            />
          </div>
          
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Anmelden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;