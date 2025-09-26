// TODO: Complete the error handling middleware
module.exports = (err, req, res, next) => {
  // Log the error with details:
  // - message, stack, url, method, requestId (if available)
  console.error('Error occurred:', err.message);

  // Handle specific error types:
  
  // 1. ValidationError (from express-validator)
  // Return 400 with { error: 'Validation Error', message: err.message, details: err.details }
  
  // 2. "Comic not found" messages
  // Return 404 with { error: 'Comic not found', message: 'The requested comic does not exist' }
  
  // 3. "Invalid comic ID" messages  
  // Return 400 with { error: 'Invalid comic ID', message: 'Comic ID must be a positive integer' }
  
  // 4. Operational errors (errors with isOperational: true property)
  // Return the error's statusCode with { error: err.message, timestamp: err.timestamp }
  
  // 5. Default case - don't expose internal error details
  // Return 500 with { error: 'Internal Server Error', message: 'Something went wrong on our end' }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Error handler not implemented'
  });
};