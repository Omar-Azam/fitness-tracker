/**
 * Middleware to validate progress log payloads for create and update operations
 */
export const validateProgress = (req, res, next) => {
  const { date, weight, bodyMeasurements, performanceMetrics } = req.body;

  // Validate date if provided
  if (date !== undefined && date !== null) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
  }

  // Validate weight if provided
  if (weight !== undefined && weight !== null && weight !== '') {
    const numWeight = Number(weight);
    if (isNaN(numWeight) || numWeight < 0) {
      return res.status(400).json({ error: 'Weight must be a non-negative number' });
    }
  }

  // Validate bodyMeasurements if provided
  if (bodyMeasurements !== undefined && bodyMeasurements !== null) {
    if (typeof bodyMeasurements !== 'object' || Array.isArray(bodyMeasurements)) {
      return res.status(400).json({ error: 'bodyMeasurements must be an object' });
    }

    const measurementKeys = ['chest', 'waist', 'hips', 'arms', 'thighs'];
    for (const key of measurementKeys) {
      if (bodyMeasurements[key] !== undefined && bodyMeasurements[key] !== null && bodyMeasurements[key] !== '') {
        const val = Number(bodyMeasurements[key]);
        if (isNaN(val) || val < 0) {
          return res.status(400).json({ error: `${key} measurement must be a non-negative number` });
        }
      }
    }
  }

  // Validate performanceMetrics if provided
  if (performanceMetrics !== undefined && performanceMetrics !== null) {
    if (!Array.isArray(performanceMetrics)) {
      return res.status(400).json({ error: 'performanceMetrics must be an array' });
    }

    for (let i = 0; i < performanceMetrics.length; i++) {
      const metric = performanceMetrics[i];
      if (!metric || typeof metric !== 'object') {
        return res.status(400).json({ error: `Performance metric at row ${i + 1} is invalid` });
      }

      if (!metric.metricName || typeof metric.metricName !== 'string' || !metric.metricName.trim()) {
        return res.status(400).json({ error: `Metric name is required at row ${i + 1}` });
      }

      if (metric.value === undefined || metric.value === null || isNaN(Number(metric.value)) || Number(metric.value) < 0) {
        return res.status(400).json({ error: `Metric value must be a non-negative number for ${metric.metricName}` });
      }
    }
  }

  next();
};
