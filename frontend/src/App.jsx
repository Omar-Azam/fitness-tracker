import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Fitness Tracker • MERN Stack Architecture</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
