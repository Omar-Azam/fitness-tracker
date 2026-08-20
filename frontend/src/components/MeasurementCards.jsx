import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Ruler,
  Scale,
} from 'lucide-react';

const MEASUREMENT_CONFIG = [
  { key: 'weight', label: 'Weight', isTopLevel: true, defaultUnit: 'kg' },
  { key: 'chest', label: 'Chest', isTopLevel: false, defaultUnit: 'cm' },
  { key: 'waist', label: 'Waist', isTopLevel: false, defaultUnit: 'cm' },
  { key: 'hips', label: 'Hips', isTopLevel: false, defaultUnit: 'cm' },
  { key: 'arms', label: 'Arms', isTopLevel: false, defaultUnit: 'cm' },
  { key: 'thighs', label: 'Thighs', isTopLevel: false, defaultUnit: 'cm' },
];

export default function MeasurementCards({
  latestLog,
  previousLog,
  weightUnit = 'kg',
  lengthUnit = 'cm',
}) {
  const getMeasurementVal = (log, key, isTopLevel) => {
    if (!log) return null;
    if (isTopLevel) {
      return log[key] !== undefined && log[key] !== null ? Number(log[key]) : null;
    }
    return log.bodyMeasurements?.[key] !== undefined && log.bodyMeasurements?.[key] !== null
      ? Number(log.bodyMeasurements[key])
      : null;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {MEASUREMENT_CONFIG.map(({ key, label, isTopLevel }) => {
        const unit = key === 'weight' ? weightUnit : lengthUnit;
        const current = getMeasurementVal(latestLog, key, isTopLevel);
        const prev = getMeasurementVal(previousLog, key, isTopLevel);

        let delta = null;
        let pctChange = null;

        if (current !== null && prev !== null && prev > 0) {
          delta = Math.round((current - prev) * 10) / 10;
          pctChange = Math.round(((current - prev) / prev) * 1000) / 10;
        }

        const isWeight = key === 'weight';

        return (
          <div
            key={key}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-lg flex flex-col justify-between space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">
                {label}
              </span>
              {isWeight ? (
                <Scale className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Ruler className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {current !== null ? current : '--'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{unit}</span>
              </div>

              {/* % Change Delta */}
              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono font-medium">
                {pctChange === null ? (
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">No baseline</span>
                ) : pctChange === 0 ? (
                  <span className="inline-flex items-center text-slate-500 dark:text-slate-400">
                    <Minus className="h-3 w-3 mr-0.5" />
                    0.0%
                  </span>
                ) : pctChange > 0 ? (
                  <span className="inline-flex items-center text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                    +{pctChange}%
                  </span>
                ) : (
                  <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                    {pctChange}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
