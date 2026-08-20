import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  Settings as SettingsIcon,
  User,
  Globe,
  Moon,
  Sun,
  Monitor,
  Bell,
  Save,
  Palette,
  CheckCircle2,
  Camera,
  Upload,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function Settings() {
  const { user, updateProfile, uploadProfilePicture } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    units: user?.preferences?.units || 'metric',
    theme: theme || user?.preferences?.theme || 'dark',
    notificationsEnabled: user?.preferences?.notificationsEnabled ?? true,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        units: user.preferences?.units || 'metric',
        theme: theme || user.preferences?.theme || 'dark',
        notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
      }));
    }
  }, [user, theme]);

  // Clean up object URL when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleThemeToggle = (selectedTheme) => {
    setTheme(selectedTheme);
    setFormData((prev) => ({ ...prev, theme: selectedTheme }));
  };

  // Handle local file selection with client validation
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file format. Please choose a JPG, PNG, or WebP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 2MB limit. Please choose a smaller image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Cancel selected preview
  const handleCancelPreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Upload photo to Cloudinary
  const handleUploadPhoto = async () => {
    if (!selectedFile) return;

    setUploadingPhoto(true);
    try {
      await uploadProfilePicture(selectedFile);
      toast.success('Profile photo updated successfully! 📸');
      handleCancelPreview();
    } catch (err) {
      console.error('Profile picture upload error:', err);
      toast.error(err.message || 'Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile({
        name: formData.name,
        preferences: {
          units: formData.units,
          theme: formData.theme,
          notificationsEnabled: formData.notificationsEnabled,
        },
      });
      toast.success('Preferences saved successfully! ✨');
    } catch (err) {
      toast.error(err.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const currentDisplayAvatar = previewUrl || user?.profilePicture;

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 space-y-6 px-2 sm:px-4">
      {/* Header */}
      <PageHeader
        title="Settings & Preferences"
        subtitle="Customize measurement units, interface themes, and profile avatar"
      />

      {/* Profile & Avatar Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
          <User className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Profile & Photo</h2>
        </div>

        {/* Profile Picture Upload Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
          {/* Avatar Image / Placeholder */}
          <div className="relative group shrink-0">
            {currentDisplayAvatar ? (
              <img
                src={currentDisplayAvatar}
                alt={user?.name || user?.username || 'Profile avatar'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-2xl uppercase font-mono shadow-md">
                {user?.username ? user.username.charAt(0) : <User className="h-8 w-8" />}
              </div>
            )}

            {previewUrl && (
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase shadow">
                Preview
              </span>
            )}
          </div>

          {/* Controls & Actions */}
          <div className="space-y-2 flex-1">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Profile Photo
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Upload a picture to personalize your dashboard and navbar. Stored securely on Cloudinary.
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {!selectedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white text-xs font-semibold transition cursor-pointer border border-slate-700 shadow-sm"
                >
                  <Camera className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Change photo</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleUploadPhoto}
                    disabled={uploadingPhoto}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {uploadingPhoto ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Photo</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelPreview}
                    disabled={uploadingPhoto}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                </>
              )}

              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                JPG, PNG, WebP · Max 2MB
              </span>
            </div>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full sm:max-w-md px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Units & Measurement Preferences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Globe className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Units of Measurement</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <label
              className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                formData.units === 'metric'
                  ? 'bg-slate-50 dark:bg-slate-950 border-emerald-500/50 ring-1 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">Metric System</span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Kilograms (kg), Kilometers (km), Centimeters (cm)</span>
              </div>
              <input
                type="radio"
                name="units"
                value="metric"
                checked={formData.units === 'metric'}
                onChange={handleChange}
                className="text-emerald-500 focus:ring-emerald-500 h-4 w-4 shrink-0 ml-2"
              />
            </label>

            <label
              className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                formData.units === 'imperial'
                  ? 'bg-slate-50 dark:bg-slate-950 border-emerald-500/50 ring-1 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">Imperial System</span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Pounds (lbs), Miles (mi), Inches (in)</span>
              </div>
              <input
                type="radio"
                name="units"
                value="imperial"
                checked={formData.units === 'imperial'}
                onChange={handleChange}
                className="text-emerald-500 focus:ring-emerald-500 h-4 w-4 shrink-0 ml-2"
              />
            </label>
          </div>
        </div>

        {/* 3-Mode Theme Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Palette className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Interface Theme</h2>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Active: <strong className="capitalize text-emerald-600 dark:text-emerald-400">{formData.theme}</strong> ({resolvedTheme})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Light Mode Card */}
            <button
              type="button"
              id="theme-light-btn"
              onClick={() => handleThemeToggle('light')}
              className={`p-3.5 sm:p-4 rounded-xl border flex flex-col items-start gap-3 text-left transition cursor-pointer ${
                formData.theme === 'light'
                  ? 'bg-amber-500/10 dark:bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 shrink-0">
                  <Sun className="h-5 w-5" />
                </div>
                {formData.theme === 'light' && (
                  <CheckCircle2 className="h-4.5 w-4.5 text-amber-500" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">Light Mode</span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Clean, bright high-contrast aesthetic</span>
              </div>
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              id="theme-dark-btn"
              onClick={() => handleThemeToggle('dark')}
              className={`p-3.5 sm:p-4 rounded-xl border flex flex-col items-start gap-3 text-left transition cursor-pointer ${
                formData.theme === 'dark'
                  ? 'bg-indigo-500/10 dark:bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shrink-0">
                  <Moon className="h-5 w-5" />
                </div>
                {formData.theme === 'dark' && (
                  <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">Dark Mode</span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Sleek slate with luminous accents</span>
              </div>
            </button>

            {/* System Auto-Detect Mode Card */}
            <button
              type="button"
              id="theme-system-btn"
              onClick={() => handleThemeToggle('system')}
              className={`p-3.5 sm:p-4 rounded-xl border flex flex-col items-start gap-3 text-left transition cursor-pointer ${
                formData.theme === 'system'
                  ? 'bg-emerald-500/10 dark:bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                  <Monitor className="h-5 w-5" />
                </div>
                {formData.theme === 'system' && (
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">System Auto</span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Syncs live with your OS/browser</span>
              </div>
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Bell className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Notifications</h2>
          </div>

          <label className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">In-App Milestone Notifications</span>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Receive alerts when completing 3+ weekly workouts</span>
            </div>
            <input
              type="checkbox"
              name="notificationsEnabled"
              checked={formData.notificationsEnabled}
              onChange={handleChange}
              className="h-5 w-5 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer ml-3 shrink-0"
            />
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
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
