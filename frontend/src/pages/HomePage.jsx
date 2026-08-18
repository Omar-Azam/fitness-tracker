import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusCard from '../components/StatusCard';
import { Database, Layers, Flame, Code2, Zap, ArrowUpRight } from 'lucide-react';

export default function HomePage() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/health');
      setStatusData(response.data);
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-10 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <Zap className="h-3.5 w-3.5" />
          MERN Fullstack Project Initialized
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Fitness Tracker <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Developer Workspace
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
          Clean, modular fullstack skeleton powered by Node.js, Express, MongoDB (Mongoose), and React with Vite & Tailwind CSS.
        </p>
      </section>

      {/* Live Health Check Connection Section */}
      <section className="max-w-2xl mx-auto">
        <StatusCard 
          statusData={statusData} 
          loading={loading} 
          error={error} 
          onRetry={fetchHealth} 
        />
      </section>

      {/* Project Structure Overview Cards */}
      <section className="max-w-5xl mx-auto pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            Project Architecture
          </h2>
          <span className="text-xs text-slate-500">Modular Structure</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backend Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Backend API</h3>
                  <p className="text-xs text-slate-400">/fitness-tracker/backend</p>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">Port 5000</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <code className="text-emerald-400 bg-slate-800/80 px-1.5 py-0.5 rounded">/config/db.js</code>
                <span className="text-slate-400">— Mongoose DB connection</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="text-emerald-400 bg-slate-800/80 px-1.5 py-0.5 rounded">/controllers</code>
                <span className="text-slate-400">— Modular route controllers</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="text-emerald-400 bg-slate-800/80 px-1.5 py-0.5 rounded">/middleware</code>
                <span className="text-slate-400">— Central error & 404 handler</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="text-emerald-400 bg-slate-800/80 px-1.5 py-0.5 rounded">/models</code>
                <span className="text-slate-400">— Mongoose schemas</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="text-emerald-400 bg-slate-800/80 px-1.5 py-0.5 rounded">/routes</code>
                <span className="text-slate-400">— Express routers & health check</span>
              </li>
            </ul>
          </div>

          {/* Frontend Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Frontend Client</h3>
                  <p className="text-xs text-slate-400">/fitness-tracker/frontend</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Port 5173</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <code className="text-teal-400 bg-slate-800/80 px-1.5 py-0.5 rounded">/src/services/api.js</code>
                <span className="text-slate-400">— Configured Axios client</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="text-teal-400 bg-slate-800/80 px-1.5 py-0.5 rounded">/src/pages</code>
                <span className="text-slate-400">— View components & routes</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="text-teal-400 bg-slate-800/80 px-1.5 py-0.5 rounded">/src/components</code>
                <span className="text-slate-400">— Reusable UI components</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="text-teal-400 bg-slate-800/80 px-1.5 py-0.5 rounded">/src/context</code>
                <span className="text-slate-400">— State management providers</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="text-teal-400 bg-slate-800/80 px-1.5 py-0.5 rounded">/src/hooks</code>
                <span className="text-slate-400">— Custom React hooks</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
