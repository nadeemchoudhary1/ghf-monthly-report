/**
 * Handle 404 routes without exposing internal structure.
 */
export function notFoundHandler(_req, res) {
  return res.status(404).json({
    success: false,
    status: 'not_found',
    message: 'Endpoint not found.',
  });
}

/**
 * Production-safe centralized Express error handler.
 * Never leaks stack traces or database credentials.
 */
export function errorHandler(err, _req, res, _next) {
  if (err?.type === 'entity.too.large' || err?.status === 413) {
    return res.status(413).json({
      success: false,
      status: 'validation_error',
      message: 'Submission payload exceeds maximum allowed size.',
      errors: ['Payload too large.'],
    });
  }

  if (err instanceof SyntaxError && err?.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      message: 'Malformed JSON request body.',
      errors: ['Invalid JSON syntax.'],
    });
  }

  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      status: 'forbidden',
      message: 'Origin not allowed.',
    });
  }

  console.error('[SERVER] Unhandled error:', err?.message || 'Unknown error');

  return res.status(500).json({
    success: false,
    status: 'failed',
    message: 'Temporary submission failure',
  });
}
