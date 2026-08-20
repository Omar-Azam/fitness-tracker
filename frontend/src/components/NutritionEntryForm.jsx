import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Utensils,
  Calendar,
  AlertCircle,
  Save,
  Flame,
  PieChart,
  Copy,
} from 'lucide-react';

export default function NutritionEntryForm({
  initialData,
  defaultMealType,
  initialMealType = 'breakfast',
  defaultDate,
  selectedDate,
  isDuplicate = false,
  onSubmit,
  onCancel,
  onClose,
  isSubmitting,
}) {
  const activeMealType = defaultMealType || initialMealType || 'breakfast';
  const activeDate = defaultDate || selectedDate || new Date().toISOString().split('T')[0];
  const handleClose = onCancel || onClose;
  const isEditing = Boolean(initialData?._id) && !isDuplicate;

  const [formData, setFormData] = useState({
    mealType: activeMealType,
    date: activeDate,
    foodItems: [],
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        mealType: initialData.mealType || activeMealType,
        date: isDuplicate
          ? activeDate
          : initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : activeDate,
        foodItems: Array.isArray(initialData.foodItems)
          ? initialData.foodItems.map((item) => ({
              name: item.name || '',
              quantity: item.quantity !== undefined ? item.quantity : 1,
              unit: item.unit || 'serving',
              calories: item.calories !== undefined ? item.calories : '',
              protein: item.protein !== undefined ? item.protein : '',
              carbs: item.carbs !== undefined ? item.carbs : '',
              fat: item.fat !== undefined ? item.fat : '',
            }))
          : [],
      });
    } else {
      setFormData({
        mealType: activeMealType,
        date: activeDate,
        foodItems: [
          {
            name: '',
            quantity: 1,
            unit: 'serving',
            calories: '',
            protein: '',
            carbs: '',
            fat: '',
          },
        ],
      });
    }
  }, [initialData, activeMealType, activeDate, isDuplicate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  // Dynamic food item handlers
  const handleAddFoodItem = () => {
    setFormData((prev) => ({
      ...prev,
      foodItems: [
        ...prev.foodItems,
        {
          name: '',
          quantity: 1,
          unit: 'serving',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
        },
      ],
    }));
  };

  const handleRemoveFoodItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      foodItems: prev.foodItems.filter((_, i) => i !== index),
    }));
  };

  const handleFoodItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.foodItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
      return { ...prev, foodItems: updatedItems };
    });
    if (errorMessage) setErrorMessage('');
  };

  // Live calculation of subtotals in modal
  const subtotalCalories = formData.foodItems.reduce(
    (acc, item) => acc + (Number(item.calories) || 0),
    0
  );
  const subtotalProtein = formData.foodItems.reduce(
    (acc, item) => acc + (Number(item.protein) || 0),
    0
  );
  const subtotalCarbs = formData.foodItems.reduce(
    (acc, item) => acc + (Number(item.carbs) || 0),
    0
  );
  const subtotalFat = formData.foodItems.reduce(
    (acc, item) => acc + (Number(item.fat) || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.foodItems.length === 0) {
      setErrorMessage('Please add at least one food item');
      return;
    }

    // Validate food item rows
    for (let i = 0; i < formData.foodItems.length; i++) {
      const item = formData.foodItems[i];
      if (!item.name.trim()) {
        setErrorMessage(`Please provide a name for food item #${i + 1}`);
        return;
      }
      if (Number(item.quantity) < 0) {
        setErrorMessage(`Quantity cannot be negative for ${item.name}`);
        return;
      }
      if (Number(item.calories) < 0) {
        setErrorMessage(`Calories cannot be negative for ${item.name}`);
        return;
      }
    }

    const payload = {
      mealType: formData.mealType,
      date: formData.date,
      foodItems: formData.foodItems.map((item) => ({
        name: item.name.trim(),
        quantity: Number(item.quantity) || 1,
        unit: item.unit ? item.unit.trim() : 'serving',
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
      })),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save nutrition entry');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {isDuplicate ? (
                <Copy className="h-5 w-5" />
              ) : (
                <Utensils className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isDuplicate
                  ? 'Quick-Add / Duplicate Meal'
                  : isEditing
                  ? 'Edit Meal Entry'
                  : 'Log Meal Entry'}
              </h2>
              <p className="text-xs text-slate-400 capitalize">
                {formData.mealType} • {formData.date}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Meal Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Meal Category
              </label>
              <select
                name="mealType"
                value={formData.mealType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm capitalize"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Dynamic Food Items List */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Food Items ({formData.foodItems.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Track individual ingredients, calories, and macronutrients
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddFoodItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Food Item
              </button>
            </div>

            {formData.foodItems.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-slate-400 text-xs">
                No food items added. Click "+ Add Food Item" above.
              </div>
            ) : (
              <div className="space-y-3.5">
                {formData.foodItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    {/* Row 1: Name, Quantity, Unit, Remove */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          placeholder="Food name (e.g. Scrambled Eggs)"
                          value={item.name}
                          onChange={(e) =>
                            handleFoodItemChange(index, 'name', e.target.value)
                          }
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            handleFoodItemChange(index, 'quantity', e.target.value)
                          }
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Unit (g, cup, pcs)"
                          value={item.unit}
                          onChange={(e) =>
                            handleFoodItemChange(index, 'unit', e.target.value)
                          }
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveFoodItem(index)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Macros (Calories, Protein, Carbs, Fat) */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] text-amber-400 uppercase font-semibold mb-1">
                          Calories
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0 kcal"
                          value={item.calories}
                          onChange={(e) =>
                            handleFoodItemChange(index, 'calories', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-cyan-400 uppercase font-semibold mb-1">
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0g"
                          value={item.protein}
                          onChange={(e) =>
                            handleFoodItemChange(index, 'protein', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-emerald-400 uppercase font-semibold mb-1">
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0g"
                          value={item.carbs}
                          onChange={(e) =>
                            handleFoodItemChange(index, 'carbs', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-semibold mb-1">
                          Fat (g)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0g"
                          value={item.fat}
                          onChange={(e) =>
                            handleFoodItemChange(index, 'fat', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subtotal Preview */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <Flame className="h-4 w-4 text-amber-400" />
              <span>Entry Total: {subtotalCalories} kcal</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
              <span className="text-cyan-400">P: {Math.round(subtotalProtein * 10) / 10}g</span>
              <span className="text-emerald-400">C: {Math.round(subtotalCarbs * 10) / 10}g</span>
              <span className="text-purple-400">F: {Math.round(subtotalFat * 10) / 10}g</span>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-semibold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>
                  {isDuplicate
                    ? 'Save Duplicate'
                    : isEditing
                    ? 'Save Changes'
                    : 'Log Meal'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
