import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';

/**
 * Forgot Password Page
 * Allows users to request a password reset link by providing their registered email.
 * Adheres to security best practices with neutral messages and email configuration notices.
 */
function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPassword(cleanEmail);
      setSuccessInfo(data);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Unable to process your request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xs border border-[#E7E3DA] p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#1B382B]/10 text-[#1B382B] rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1B382B]">
            Forgot Password
          </h1>
          <p className="text-xs sm:text-sm text-[#5C645E] mt-1.5 leading-relaxed">
            Enter your account email to receive secure password reset instructions
          </p>
        </div>

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

        {/* Success / Status Message */}
        {successInfo ? (
          <div className="space-y-4">
            {successInfo.emailConfigured === false ? (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-amber-950">Email Service Not Configured</p>
                    <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                      {successInfo.message}
                    </p>
                  </div>
                </div>

                {successInfo.devResetUrl && (
                  <div className="mt-3 pt-3 border-t border-amber-200/80 bg-white/70 p-2.5 rounded text-xs space-y-1">
                    <p className="font-semibold text-amber-900">Development Reset Link:</p>
                    <a
                      href={successInfo.devResetUrl}
                      className="text-[#1B382B] underline break-all font-mono text-[11px] hover:text-[#C05634]"
                    >
                      {successInfo.devResetUrl}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div className="leading-relaxed">
                  <p className="font-semibold text-emerald-900">Check Your Inbox</p>
                  <p className="mt-1">{successInfo.message}</p>
                  <p className="mt-2 text-[11px] text-emerald-700">
                    The reset link remains valid for 30 minutes. If you don't see it, please check your spam folder.
                  </p>
                </div>
              </div>
            )}

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B382B] hover:text-[#C05634] transition-colors"
              >
                <span>&larr;</span>
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-semibold text-[#1C201D] mb-1.5"
              >
                Registered Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={loading}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E7E3DA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] text-[#1C201D] placeholder-[#5C645E]/70 disabled:bg-[#F4F1EA] transition-colors"
                required
              />
            </div>

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
                  <span>Sending Instructions...</span>
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center mt-6 text-xs text-[#5C645E]">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-[#1B382B] hover:text-[#C05634] font-semibold transition-colors"
              >
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
