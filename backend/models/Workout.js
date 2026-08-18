import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    sets: {
      type: Number,
      min: [1, 'Sets must be at least 1'],
      default: 1,
    },
    reps: {
      type: Number,
      min: [0, 'Reps cannot be negative'],
      default: 0,
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Workout must belong to a user'],
    },
    name: {
      type: String,
      required: [true, 'Workout name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['strength', 'cardio', 'flexibility', 'other'],
        message: '{VALUE} is not a valid workout category',
      },
      default: 'strength',
    },
    tags: {
      type: [String],
      default: [],
    },
    exercises: {
      type: [exerciseSchema],
      default: [],
    },
    date: {
      type: Date,
      required: [true, 'Workout date is required'],
      default: Date.now,
    },
    duration: {
      type: Number, // in minutes
      min: [0, 'Duration cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying workouts by user and date range
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, category: 1 });

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;
