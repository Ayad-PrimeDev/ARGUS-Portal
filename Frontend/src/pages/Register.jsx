import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Register Page
 * Provides a clean form for new user registration (name, email, password)
 * Integrates with AuthContext and displays loading, success, and error states.
 */
function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  // Consume register function and loading state from AuthContext
  const { register, loading } = useAuth();

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
    setSuccessMessage('');

    // Basic frontend validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccessMessage('Registration successful! You can now log in to your account.');
      // Reset form fields upon successful registration
      setFormData({
        name: '',
        email: '',
        password: '',
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    }
  };

  const loginLink = redirectParam
    ? `/login?redirect=${encodeURIComponent(redirectParam)}`
    : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xs border border-[#E7E3DA] p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1B382B]">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-[#5C645E] mt-1.5 leading-relaxed">
            Join ARGUS to report, track, and recover lost belongings
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm">
            <p className="font-semibold flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-emerald-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{successMessage}</span>
            </p>
            <p className="mt-2 pt-2 border-t border-emerald-200/60">
              <Link to={loginLink} className="text-[#1B382B] font-semibold hover:text-[#C05634] inline-flex items-center gap-1">
                <span>Proceed to Sign In</span>
                <span>&rarr;</span>
              </Link>
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-red-600 shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-[#1C201D] mb-1.5"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Alex Morgan"
              disabled={loading}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E7E3DA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] text-[#1C201D] placeholder-[#5C645E]/70 disabled:bg-[#F4F1EA] transition-colors"
              required
            />
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#1C201D] mb-1.5"
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
              className="w-full px-3.5 py-2.5 bg-white border border-[#E7E3DA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] text-[#1C201D] placeholder-[#5C645E]/70 disabled:bg-[#F4F1EA] transition-colors"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#1C201D] mb-1.5"
            >
              Password <span className="font-normal text-[#5C645E]">(min. 6 characters)</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E7E3DA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] text-[#1C201D] placeholder-[#5C645E]/70 disabled:bg-[#F4F1EA] transition-colors"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-sm font-semibold rounded-lg shadow-xs transition-colors disabled:bg-[#1B382B]/60 disabled:cursor-not-allowed mt-2 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center mt-6 text-xs text-[#5C645E]">
          Already have an account?{' '}
          <Link
            to={loginLink}
            className="text-[#1B382B] hover:text-[#C05634] font-semibold transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
