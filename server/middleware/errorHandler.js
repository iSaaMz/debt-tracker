export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // PostgreSQL errors
  if (err.code === '23502') {
    return res.status(400).json({
      error: 'Missing required field',
      message: 'All fields are required'
    });
  }

  if (err.code === '23514') {
    return res.status(400).json({
      error: 'Invalid data',
      message: 'Invalid payer name or amount'
    });
  }

  if (err.code === '22P02') {
    return res.status(400).json({
      error: 'Invalid data type',
      message: 'Please check your input format'
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};