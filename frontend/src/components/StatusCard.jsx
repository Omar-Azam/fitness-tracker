import React from 'react';
import { CheckCircle2, XCircle, RefreshCw, Server, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function StatusCard({ statusData, loading, error, onRetry }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            loading 
              ? 'bg-slate-800 text-slate-400' 
              : error 
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            <Server className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Backend Health Check</h3>
            <p className="text-sm text-slate-400">
              Testing connection to <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono">GET /api/health</code>
            </p>
          </div>
        </div>

        <button
          onClick={onRetry}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          {loading ? 'Checking...' : 'Ping API'}
        </button>
      </div>

      {/* Main Status Display */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-3 py-6 text-slate-400">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Connecting to backend server...</span>
          </div>
        ) : error ? (
          <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-4 mt-2">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-rose-300">Connection Failed</h4>
                <p className="text-xs text-rose-200/80 mt-1">{error}</p>
                <div className="mt-3 text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <p className="font-medium text-slate-300 mb-1">Troubleshooting Tips:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Ensure the backend server is running (<code className="text-emerald-400">npm run dev</code> in <code className="text-slate-300">/backend</code>)</li>
                    <li>Verify backend is listening on port 5000</li>
                    <li>Check that CORS permits origin <code className="text-slate-300">http://localhost:5173</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : statusData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Connection Status</span>
                  <p className="text-base font-bold text-white flex items-center gap-2">
                    {statusData.message || 'Connected successfully'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 uppercase tracking-wide">
                  {statusData.status || 'OK'}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
                <Clock className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Server Timestamp</div>
                  <div className="text-xs text-slate-200 font-mono truncate mt-0.5">
                    {statusData.timestamp ? new Date(statusData.timestamp).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Uptime</div>
                  <div className="text-xs text-slate-200 font-mono mt-0.5">
                    {statusData.uptime ? `${Math.round(statusData.uptime)} seconds` : 'Active'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
