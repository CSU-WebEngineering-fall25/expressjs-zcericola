const { error } = require( 'winston' );

// TODO: Complete the error handling middleware
module.exports = (err, req, res, next) => {
  console.log('error coming through: ', err);
  // Log the error with details:
  // - message, stack, url, method, requestId (if available)
  const errorDetails = {
    stack: err.stack,
    url: req.url,
    method: req.method,
    requestId: req.requestId
  };
  const comicNotFoundErrorTitle = "Comic not found";
  const invalidComicIdErrorTitle = "Invalid comic ID";
  console.error('Error occurred:', { message: err.message, ...errorDetails });

  // Handle specific error types:
  
  // 1. ValidationError (from express-validator)
  // Return 400 with { error: 'Validation Error', message: err.message, details: err.details }
  if (err.statusCode === 400 && err.message !== invalidComicIdErrorTitle) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      ...errorDetails
    });
  }
  
  if (err.message === comicNotFoundErrorTitle) {
    // 2. "Comic not found" messages
    // Return 404 with { error: 'Comic not found', message: 'The requested comic does not exist' }
    return res.status(404).json({
      error: comicNotFoundErrorTitle,
      message: 'The requested comic does not exist'
    });
  } else if (err.message === invalidComicIdErrorTitle) {
    // 3. "Invalid comic ID" messages  
    // Return 400 with { error: 'Invalid comic ID', message: 'Comic ID must be a positive integer' }
    return res.status(400).json({
      error: invalidComicIdErrorTitle,
      message: 'Comic ID must be a positive integer'
    });
  } else if (err.isOperational) {
    // 4. Operational errors (errors with isOperational: true property)
    // Return the error's statusCode with { error: err.message, timestamp: err.timestamp }
    return res.status(err.statusCode).json({
      error: err.message,
      timestamp: err.timestamp
    });
  } else {
    // 5. Default case - don't expose internal error details
    // Return 500 with { error: 'Internal Server Error', message: 'Something went wrong on our end' }
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong on our end'
    });

  }
};