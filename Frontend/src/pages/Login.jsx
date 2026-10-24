import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login Page
 * Allows registered users to authenticate with email and password.
 * Integrates with AuthContext and redirects to /dashboard upon success.
 */
function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  // Consume login function and loading state from AuthContext
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic frontend validation
    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Redirect user to dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      // Handles wrong password, invalid email, or server error
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] p-4">
      <div className="w-full max-w-md bg-white rounded-md shadow-xs border border-[#E7E3DA] p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#1B382B]">Welcome Back</h1>
          <p className="text-xs sm:text-sm text-[#5C645E] mt-1.5">
            Sign in to access your ARGUS reports and claims
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50/70 border border-red-200 text-red-700 text-xs sm:text-sm rounded">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-[#1C201D] mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              disabled={loading}
              className="w-full px-3 py-2 border border-[#E7E3DA] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#1B382B] focus:border-[#1B382B] text-[#1C201D] placeholder-[#5C645E] disabled:bg-[#F4F1EA]"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-[#1C201D] mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              className="w-full px-3 py-2 border border-[#E7E3DA] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#1B382B] focus:border-[#1B382B] text-[#1C201D] placeholder-[#5C645E] disabled:bg-[#F4F1EA]"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-sm font-semibold rounded shadow-xs transition-colors disabled:bg-[#1B382B]/60 disabled:cursor-not-allowed mt-2 cursor-pointer"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center mt-6 text-xs text-[#5C645E]">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-[#1B382B] hover:text-[#C05634] font-medium transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
