import React from 'react';
import ReactDOM from 'react-dom/client';
import PrometheusExerciseLibrary from './components/ExerciseLibrary';
import './index.css';

// Create a root element and render your app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PrometheusExerciseLibrary />
  </React.StrictMode>
);