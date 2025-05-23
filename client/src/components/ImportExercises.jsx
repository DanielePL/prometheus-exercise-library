// src/components/ImportExercises.jsx
import React, { useState } from 'react';
import { importExercises } from '../api/exercises';

const ImportExercises = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const result = await importExercises(file);
      setResult(result);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Import Exercises</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Excel File
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Importing...' : 'Import Exercises'}
        </button>
      </form>

      {result && (
        <div className="mt-4">
          {result.error ? (
            <div className="text-red-500">Error: {result.error}</div>
          ) : (
            <div className="text-green-500">
              Successfully imported {result.imported} exercises.
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-yellow-500">Warnings: {result.errors.length}</p>
                  <ul className="text-yellow-400 text-sm mt-1">
                    {result.errors.slice(0, 5).map((err, index) => (
                      <li key={index}>{err.row}: {err.error}</li>
                    ))}
                    {result.errors.length > 5 && <li>... and {result.errors.length - 5} more</li>}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportExercises;