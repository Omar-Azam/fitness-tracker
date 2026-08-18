import mongoose from 'mongoose';

const preferencesSchema = new mongoose.Schema(
  {
    units: {
      type: String,
      enum: {
        values: ['metric', 'imperial'],
        message: '{VALUE} is not a valid unit system (must be metric or imperial)',
      },
      default: 'metric',
    },
    theme: {
      type: String,
      enum: {
        values: ['light', 'dark'],
        message: '{VALUE} is not a valid theme (must be light or dark)',
      },
      default: 'dark',
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    profilePicture: {
      type: String,
      trim: true,
      default: '',
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
