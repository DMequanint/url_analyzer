import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import DetailsPage from './pages/DetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/details/:id" element={<DetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

