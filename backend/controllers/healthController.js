/**
 * @desc    Health check endpoint
 * @route   GET /api/health
 * @access  Public
 */
export const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Fitness Tracker API is operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};
