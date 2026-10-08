import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      {/* 
        This is the main routing component. 
        Later, we can add a persistent Navigation Bar here. 
      */}
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<div className="p-8 text-center text-2xl font-bold">Home Page Placeholder</div>} />
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
