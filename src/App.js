import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Rifiuti from './pages/Rifiuti';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rifiuti" element={<Rifiuti />} />
    </Routes>
  );
}

export default App;
