import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  User,
  Globe,
  Moon,
  Sun,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  Shield,
  Palette,
} from 'lucide-react';

export default function Settings() {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    profilePicture: user?.profilePicture || '',
    units: user?.preferences?.units || 'metric',
    theme: user?.preferences?.theme || 'dark',
    notificationsEnabled: user?.preferences?.notificationsEnabled ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        profilePicture: user.profilePicture || '',
        units: user.preferences?.units || 'metric',
        theme: user.preferences?.theme || 'dark',
        notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (successMsg) setSuccessMsg('');
    if (errorMsg) setErrorMsg('');
  };

  const handleThemeToggle = (selectedTheme) => {
    setFormData((prev) => ({ ...prev, theme: selectedTheme }));
    if (successMsg) setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile({
        name: formData.name,
        profilePicture: formData.profilePicture,
        preferences: {
          units: formData.units,
          theme: formData.theme,
          notificationsEnabled: formData.notificationsEnabled,
        },
      });
      setSuccessMsg('Preferences saved successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 px-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Settings & Preferences
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize measurement units, interface themes, and notification preferences
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <User className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Profile Picture URL
              </label>
              <input
                type="text"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Units & Measurement Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Globe className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Units of Measurement</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                formData.units === 'metric'
                  ? 'bg-slate-950 border-emerald-500/50 ring-1 ring-emerald-500/20'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="font-bold text-white text-sm block">Metric System</span>
                <span className="text-xs text-slate-400">Kilograms (kg), Kilometers (km), Centimeters (cm)</span>
              </div>
              <input
                type="radio"
                name="units"
                value="metric"
                checked={formData.units === 'metric'}
                onChange={handleChange}
                className="text-emerald-500 focus:ring-emerald-500 h-4 w-4"
              />
            </label>

            <label
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                formData.units === 'imperial'
                  ? 'bg-slate-950 border-emerald-500/50 ring-1 ring-emerald-500/20'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="font-bold text-white text-sm block">Imperial System</span>
                <span className="text-xs text-slate-400">Pounds (lbs), Miles (mi), Inches (in)</span>
              </div>
              <input
                type="radio"
                name="units"
                value="imperial"
                checked={formData.units === 'imperial'}
                onChange={handleChange}
                className="text-emerald-500 focus:ring-emerald-500 h-4 w-4"
              />
            </label>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Palette className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Interface Theme</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleThemeToggle('dark')}
              className={`p-4 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer ${
                formData.theme === 'dark'
                  ? 'bg-slate-950 border-amber-500/50 ring-1 ring-amber-500/20'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400 border border-slate-800">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">Dark Theme</span>
                <span className="text-xs text-slate-400">Sleek slate and glowing accents</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleThemeToggle('light')}
              className={`p-4 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer ${
                formData.theme === 'light'
                  ? 'bg-slate-950 border-amber-500/50 ring-1 ring-amber-500/20'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400 border border-slate-800">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">Light Theme</span>
                <span className="text-xs text-slate-400">Clean and bright presentation</span>
              </div>
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Bell className="h-5 w-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Notifications</h2>
          </div>

          <label className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <div>
              <span className="font-bold text-white text-sm block">In-App Milestone Notifications</span>
              <span className="text-xs text-slate-400">Receive alerts when achieving weekly workout targets</span>
            </div>
            <input
              type="checkbox"
              name="notificationsEnabled"
              checked={formData.notificationsEnabled}
              onChange={handleChange}
              className="h-5 w-5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-sm transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
