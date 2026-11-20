import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Flame, User, LogOut, Zap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   Aether Editorial Warm Ambient Canvas
   ───────────────────────────────────────────── */
const NeuralBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    {/* Base warm ivory surface */}
    <div className="absolute inset-0 bg-[#fcf9f2]" />

    {/* Soft architectural terracotta & champagne ambient glows */}
    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] h-[480px] bg-gradient-to-b from-[#ffdbcd]/35 via-[#ebe8e1]/40 to-transparent blur-3xl rounded-full" />
    <div className="absolute top-1/3 -right-32 w-[520px] h-[520px] rounded-full bg-[#f6f3ec] blur-3xl" />
    <div className="absolute -bottom-24 -left-24 w-[480px] h-[480px] rounded-full bg-[#ffdbcd]/20 blur-3xl" />

    {/* Delicate hairline grid */}
    <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#33302b_1px,transparent_1px)] [background-size:24px_24px]" />
  </div>
);

/* ─────────────────────────────────────────────
   Main Landing Page (Aether Neuro-Editorial)
   ───────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const { user, login, logout, renderGoogleButton, isAdmin } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const googleBtnRef = useRef(null);

  const handleStartAssessment = () => {
    if (user) {
      navigate('/assessment');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (nameInput && emailInput) {
      login(nameInput, emailInput);
      setShowLoginModal(false);
      navigate('/assessment');
    }
  };

  // Render Google button when modal opens
  useEffect(() => {
    if (showLoginModal && googleBtnRef.current) {
      setTimeout(() => renderGoogleButton(googleBtnRef.current), 100);
    }
  }, [showLoginModal, renderGoogleButton]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#fcf9f2] font-['Plus_Jakarta_Sans'] text-[#1c1c18] flex flex-col justify-between">
      {/* 1. Warm Editorial Background */}
      <NeuralBackground />

      {/* 2. Top Navigation Bar */}
      <header className="relative z-50 px-6 sm:px-10 py-5 flex items-center justify-between backdrop-blur-xl bg-[#fcf9f2]/85 border-b border-[#e5e2db]/70">
        <div
          className="flex items-center gap-3 text-[#33302b] font-bold text-xl tracking-tight cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="p-2.5 bg-[#33302b] text-[#fcf9f2] rounded-full shadow-sm group-hover:scale-105 transition-transform">
            <Brain className="w-5 h-5" />
          </div>
          <span className="font-['Outfit'] font-semibold tracking-wider text-lg uppercase text-[#33302b]">
            NEURO<span className="text-[#8b4e33] font-light">SYNC</span>
          </span>
        </div>

        {/* Top Right Action & Navigation Bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/progress')}
            className="group inline-flex items-center gap-2 bg-[#f6f3ec] hover:bg-[#ebe8e1] border border-[#e5e2db] text-[#33302b] px-4 py-2 rounded-full font-medium text-xs transition-all shadow-sm"
          >
            View History
          </button>

          <button
            onClick={() => navigate('/tracker')}
            className="group inline-flex items-center gap-2 bg-[#f6f3ec] hover:bg-[#ebe8e1] border border-[#e5e2db] text-[#33302b] px-4 py-2 rounded-full font-medium text-xs transition-all shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-[#8b4e33] group-hover:scale-110 transition-transform" />
            Wellness Tracker
          </button>

          <button
            onClick={() => navigate('/doctor-portal')}
            className="group inline-flex items-center gap-2 bg-[#f6f3ec] hover:bg-[#ebe8e1] border border-[#e5e2db] text-[#33302b] px-4 py-2 rounded-full font-medium text-xs transition-all shadow-sm hidden sm:inline-flex"
          >
            For Providers
          </button>

          <button
            onClick={() => navigate('/admin')}
            className="group inline-flex items-center gap-2 bg-[#ebe8e1] hover:bg-[#e5e2db] border border-[#e5e2db] text-[#8b4e33] px-4 py-2 rounded-full font-semibold text-xs transition-all shadow-sm hidden sm:inline-flex"
          >
            <Shield className="w-3.5 h-3.5 text-[#8b4e33] group-hover:scale-110 transition-transform" />
            Admin
          </button>

          {user ? (
            <div className="flex items-center gap-2.5 bg-[#f1eee7] border border-[#e5e2db] px-4 py-2 rounded-full">
              <User className="w-4 h-4 text-[#8b4e33]" />
              <span className="text-xs font-semibold text-[#33302b]">Welcome, {user.name}</span>
              <button onClick={logout} className="ml-1.5 text-[#7c766e] hover:text-[#ba1a1a] transition-colors" title="Log Out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-xs font-medium text-[#fcf9f2] bg-[#33302b] hover:bg-[#1c1c18] px-5 py-2 rounded-full transition-all shadow-sm"
            >
              Log In
            </button>
          )}
        </div>
      </header>

      {/* 3. Hero Content — Centered Editorial Masterpiece */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center text-center space-y-8">
        {/* Overline Pill Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ebe8e1] text-[#33302b] shadow-sm"
        >
          <span className="text-[#8b4e33] text-sm">⚡</span>
          <span className="font-['Plus_Jakarta_Sans'] font-semibold text-xs tracking-wider uppercase text-[#4b463f]">
            NEURAL DIAGNOSTIC
          </span>
        </motion.div>

        {/* Monumental Editorial Headline */}
        <div className="space-y-5 max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-['Outfit'] text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[#1c1c18] leading-[0.98]"
          >
            <span>Decoding</span>
            <br />
            <span className="font-medium italic bg-gradient-to-r from-[#8b4e33] via-[#feae8c] to-[#7c766e] bg-clip-text text-transparent">
              Complexity.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-[#4b463f] max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Advanced deep learning linguistic models & real-time behavioral mapping to understand the neurodivergent spectrum.
          </motion.p>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-2"
        >
          <button className="upload-btn" onClick={handleStartAssessment}>
            <span className="upload-border"></span>
            <div className="upload-content">
              <span className="icon">
                <Brain className="w-5 h-5 text-[#fcf9f2]" />
              </span>
              Start Assessment
            </div>
          </button>
        </motion.div>
      </main>

      {/* 4. Bottom Floating Live Diagnostics Bar */}
      <footer className="relative z-50 px-6 sm:px-10 py-5 flex justify-center items-center">
        <div className="w-full max-w-3xl rounded-full bg-[#f6f3ec]/90 border border-[#e5e2db] shadow-sm px-6 py-3 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-medium text-[11px] text-[#4b463f] uppercase tracking-wider">Model Precision</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#e5e2db] text-[#33302b] font-['Outfit'] font-semibold text-xs">
              89.4%
            </span>
          </div>

          <div className="hidden sm:block w-px h-4 bg-[#e5e2db]" />

          <div className="flex items-center gap-2">
            <span className="font-medium text-[11px] text-[#4b463f] uppercase tracking-wider">Architecture</span>
            <span className="font-semibold text-xs text-[#33302b]">CNN + LSTM</span>
          </div>

          <div className="hidden sm:block w-px h-4 bg-[#e5e2db]" />

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8b4e33] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8b4e33]"></span>
            </span>
            <span className="font-semibold text-[10px] text-[#8b4e33] uppercase tracking-widest">
              NEURO SYNC LAB ACTIVE
            </span>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#33302b]/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#fcf9f2] rounded-3xl w-full max-w-md p-8 relative border border-[#e5e2db] shadow-2xl"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-5 right-5 text-[#7c766e] hover:text-[#1c1c18] transition-colors text-2xl font-light"
              >
                &times;
              </button>

              <div className="mb-6">
                <div className="w-12 h-12 bg-[#33302b] text-[#fcf9f2] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="font-['Outfit'] text-2xl font-semibold text-[#1c1c18] tracking-tight">Identity Sync</h2>
                <p className="text-xs text-[#4b463f] mt-1.5 leading-relaxed">
                  Log in to sync your diagnostic results with the personalized wellness tracker.
                </p>
              </div>

              <div className="space-y-3 mb-5">
                <div ref={googleBtnRef} className="w-full flex justify-center min-h-[40px]" />
                
                <button
                  type="button"
                  onClick={async () => {
                    const userPromptName = prompt("Enter your Name for Google Account:", "Google User") || "Google User";
                    const userPromptEmail = prompt("Enter your Google Email ID:", "user@gmail.com") || "user@gmail.com";
                    if (userPromptEmail) {
                      await login(userPromptName, userPromptEmail);
                      setShowLoginModal(false);
                      navigate('/assessment');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#f6f3ec] border border-[#e5e2db] text-[#33302b] font-semibold py-3 px-4 rounded-full text-xs uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Sign in with Google
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#e5e2db]"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-[#7c766e] font-semibold uppercase tracking-widest">Or enter email</span>
                  <div className="flex-grow border-t border-[#e5e2db]"></div>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-[#8b4e33] uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-[#f6f3ec] border border-[#e5e2db] rounded-full px-5 py-3 text-sm font-medium text-[#1c1c18] outline-none placeholder:text-[#cdc5bc] focus:border-[#33302b] transition-colors"
                    placeholder="E.g., John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-[#8b4e33] uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-[#f6f3ec] border border-[#e5e2db] rounded-full px-5 py-3 text-sm font-medium text-[#1c1c18] outline-none placeholder:text-[#cdc5bc] focus:border-[#33302b] transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-[#33302b] hover:bg-[#1c1c18] text-[#fcf9f2] py-3.5 rounded-full font-semibold text-xs uppercase tracking-widest shadow-sm transition-all active:scale-[0.98]"
                >
                  Confirm Identity & Continue
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
