function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Server error'

  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid resource id'
  }

  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)[0]?.message || 'Validation failed'
  }

  if (err.code === 11000) {
    statusCode = 409
    message = 'Duplicate resource'
  }

  if (statusCode >= 500) {
    console.error(err)
  }

  res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = errorHandler
