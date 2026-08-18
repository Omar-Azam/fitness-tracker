// 404 Handler for undefined API routes
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Central Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let errorMessage = err.message || 'An unexpected error occurred';

  // Server-side logging of all errors (always visible to backend logs)
  console.error(`[Server Error] [${req.method} ${req.originalUrl}] - Status: ${statusCode}:`, err.stack || err);

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 404;
    errorMessage = 'Resource not found with the specified ID format';
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle JWT token errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorMessage = 'Invalid or expired authentication token. Please log in again.';
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // In production, shield 500 internal server error details from the client
  if (isProduction && statusCode === 500) {
    errorMessage = 'An internal server error occurred. Please try again later.';
  }

  return res.status(statusCode).json({
    error: errorMessage,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
