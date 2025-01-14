
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import About from './about';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
