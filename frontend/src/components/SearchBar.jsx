import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Dumbbell, Apple, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ workouts: [], nutrition: [] });
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ workouts: [], nutrition: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/search', { params: { q: query.trim() } });
        setResults(res.data.results || { workouts: [], nutrition: [] });
        setIsOpen(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectWorkout = (workout) => {
    setIsOpen(false);
    setQuery('');
    navigate('/workouts');
  };

  const handleSelectNutrition = (entry) => {
    setIsOpen(false);
    setQuery('');
    navigate('/nutrition');
  };

  const hasResults = results.workouts.length > 0 || results.nutrition.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder="Search workouts, meals, exercises..."
          className="w-full pl-9 pr-8 py-1.5 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition"
        />
        {loading ? (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 animate-spin" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5 rounded transition cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden max-h-[75vh] overflow-y-auto">
          {!hasResults && !loading ? (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              No workouts or nutrition items found for "{query}"
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Workouts Group */}
              {results.workouts.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 pb-2">
                    <Dumbbell className="h-3.5 w-3.5" />
                    <span>Workouts ({results.workouts.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.workouts.map((w) => (
                      <button
                        key={w._id}
                        onClick={() => handleSelectWorkout(w)}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                            {w.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate">
                            {w.category} • {w.exercises?.length || 0} exercises •{' '}
                            {w.date ? new Date(w.date).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrition Group */}
              {results.nutrition.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2 pb-2">
                    <Apple className="h-3.5 w-3.5" />
                    <span>Nutrition ({results.nutrition.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.nutrition.map((n) => {
                      const totalCal = n.foodItems?.reduce(
                        (acc, item) => acc + (Number(item.calories) || 0),
                        0
                      );
                      return (
                        <button
                          key={n._id}
                          onClick={() => handleSelectNutrition(n)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between group cursor-pointer"
                        >
                          <div className="truncate pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition capitalize">
                                {n.mealType}
                              </span>
                              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                {totalCal} kcal
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {n.foodItems?.map((i) => i.name).join(', ')}
                            </p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
