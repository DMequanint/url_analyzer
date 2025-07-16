/*
  App.tsx

  Entry point for the React application.

  This component sets up application-wide routing using React Router.
  Currently, it defines a single route that renders the DashboardPage
  at the root path ("/").

  Future routes (e.g., "/about", "/settings", etc.) should be added here.
*/

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";

/* Main application component with routing config */
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
    </Routes>
  </Router>
);

export default App;

