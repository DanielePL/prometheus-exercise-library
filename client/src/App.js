// client/src/App.js
import React from 'react';
import './styles/App.css';             // Von src-Ordner aus
import './styles/index.css';  //
import ExerciseLibrary from './components/ExerciseLibrary';  // Von src-Ordner aus

function App() {
  return (
    <div className="App">
      <ExerciseLibrary />
    </div>
  );
}

export default App;