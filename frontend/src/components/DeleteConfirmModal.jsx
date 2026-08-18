import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDeleting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {title || 'Delete Workout'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300">
          {message || 'Are you sure you want to delete this workout from your log?'}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition cursor-pointer shadow-lg shadow-rose-500/20 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Workout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
