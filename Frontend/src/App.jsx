import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
          <div>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div className="p-8 text-center text-2xl font-bold">Dashboard Page Placeholder</div>
                  </ProtectedRoute>
                }
              />
              <Route path="/items" element={<div className="p-8 text-center text-2xl font-bold">Items Page Placeholder</div>} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <div className="p-8 text-center text-2xl font-bold">Profile Page Placeholder</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
