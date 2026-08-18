import mongoose from 'mongoose';

const bodyMeasurementsSchema = new mongoose.Schema(
  {
    chest: {
      type: Number,
      min: [0, 'Chest measurement cannot be negative'],
    },
    waist: {
      type: Number,
      min: [0, 'Waist measurement cannot be negative'],
    },
    hips: {
      type: Number,
      min: [0, 'Hips measurement cannot be negative'],
    },
    arms: {
      type: Number,
      min: [0, 'Arms measurement cannot be negative'],
    },
    thighs: {
      type: Number,
      min: [0, 'Thighs measurement cannot be negative'],
    },
  },
  { _id: false }
);

const performanceMetricSchema = new mongoose.Schema(
  {
    metricName: {
      type: String,
      required: [true, 'Performance metric name is required'],
      trim: true,
    },
    value: {
      type: Number,
      required: [true, 'Performance metric value is required'],
      min: [0, 'Performance metric value cannot be negative'],
    },
    unit: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

const progressLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Progress log must belong to a user'],
    },
    date: {
      type: Date,
      required: [true, 'Progress log date is required'],
      default: Date.now,
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
    },
    bodyMeasurements: {
      type: bodyMeasurementsSchema,
      default: () => ({}),
    },
    performanceMetrics: {
      type: [performanceMetricSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying progress logs by user and date
progressLogSchema.index({ user: 1, date: -1 });

const ProgressLog = mongoose.model('ProgressLog', progressLogSchema);

export default ProgressLog;
