"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { account } from '../lib/appwrite';
import { ID } from 'appwrite';

export default function Login() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true); // Default to Sign Up
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true); // Start loading to check session
  const [error, setError] = useState('');

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.get();
        router.push('/home');
      } catch (e) {
        // No session, allow login
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign Up Flow
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
      } else {
        // Sign In Flow
        await account.createEmailPasswordSession(email, password);
      }
      router.push('/home');
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm" // Reduced width
      >
        <div className="text-center mb-6"> {/* Reduced margin */}
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl shadow-blue-200"> {/* Reduced size */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-white"> {/* Reduced icon size */}
              <path d="M12 2L12 22" />
              <path d="M7 7L17 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Rabbit Quiz</h1> {/* Reduced font size */}
          <p className="text-gray-500 text-sm">Hop in to start learning</p>
        </div>

        {/* Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-6"> {/* Reduced margin */}
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${!isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Beta Warning - Only show on Sign Up */}
        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-lg">ℹ️</span>
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong className="font-semibold">Beta Version:</strong> This app is currently in beta and may contain errors or bugs. Thank you for your patience!
              </p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4"> {/* Reduced spacing */}
          {error && (
            <div className="p-2 bg-red-50 text-red-500 text-xs rounded-lg text-center">
              {error}
            </div>
          )}

          {isSignUp && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 text-sm"
                placeholder="Your Name"
                required={isSignUp}
              />
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 text-sm"
              placeholder="hello@rabbitquiz.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 text-sm"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
