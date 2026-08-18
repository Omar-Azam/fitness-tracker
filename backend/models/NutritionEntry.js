import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
      default: 1,
    },
    unit: {
      type: String,
      trim: true,
      default: 'serving',
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      default: 0,
    },
    protein: {
      type: Number, // in grams
      min: [0, 'Protein cannot be negative'],
      default: 0,
    },
    carbs: {
      type: Number, // in grams
      min: [0, 'Carbohydrates cannot be negative'],
      default: 0,
    },
    fat: {
      type: Number, // in grams
      min: [0, 'Fat cannot be negative'],
      default: 0,
    },
  },
  { _id: true }
);

const nutritionEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Nutrition entry must belong to a user'],
    },
    mealType: {
      type: String,
      required: [true, 'Meal type is required'],
      enum: {
        values: ['breakfast', 'lunch', 'dinner', 'snack'],
        message: '{VALUE} is not a valid meal type (breakfast, lunch, dinner, or snack)',
      },
      lowercase: true,
    },
    foodItems: {
      type: [foodItemSchema],
      default: [],
    },
    date: {
      type: Date,
      required: [true, 'Nutrition date is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying meals by user and date
nutritionEntrySchema.index({ user: 1, date: -1 });
nutritionEntrySchema.index({ user: 1, mealType: 1, date: -1 });

const NutritionEntry = mongoose.model('NutritionEntry', nutritionEntrySchema);

export default NutritionEntry;
