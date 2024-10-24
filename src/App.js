import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MicrophoneComponent from './MicrophoneComponent';


function App() {
  const [savedTranscripts, setSavedTranscripts] = useState([]);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MicrophoneComponent savedTranscripts={savedTranscripts} setSavedTranscripts={setSavedTranscripts} />} />
      </Routes>
    </Router>
  );
}

export default App;
