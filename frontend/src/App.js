import React from 'react';
import './App.css';
import Dropzone from './components/dropzone/Dropzone';
function App() {
  return (
    <div className="App">
      <h1>Drag and Drop Zone</h1>
      <div className="content">
        <Dropzone />
      </div>

    </div>
  );
}

export default App;
