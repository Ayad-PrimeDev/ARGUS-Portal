import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import api from './services/api';

function Home() {
  const [healthStatus, setHealthStatus] = useState('Checking backend connection...');

  useEffect(() => {
    // Call GET /api/health using our configured axios instance
    api.get('/health')
      .then((response) => {
        setHealthStatus(`✅ Backend Connected: ${response.data.message || 'OK'}`);
      })
      .catch((error) => {
        setHealthStatus(`❌ Backend Connection Failed: ${error.message}`);
      });
  }, []);

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Home Page Placeholder</h2>
      <div className="p-4 bg-white rounded shadow inline-block border">
        {healthStatus}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* 
        This is the main routing component. 
        Later, we can add a persistent Navigation Bar here. 
      */}
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<div className="p-8 text-center text-2xl font-bold">Login Page Placeholder</div>} />
          <Route path="/register" element={<div className="p-8 text-center text-2xl font-bold">Register Page Placeholder</div>} />
          <Route path="/dashboard" element={<div className="p-8 text-center text-2xl font-bold">Dashboard Page Placeholder</div>} />
          <Route path="/items" element={<div className="p-8 text-center text-2xl font-bold">Items Page Placeholder</div>} />
          <Route path="/profile" element={<div className="p-8 text-center text-2xl font-bold">Profile Page Placeholder</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
