module.exports = (err, req, res, next) => {
  console.error(err.stack);

  const isClientError = err.statusCode >= 400 && err.statusCode < 500;
  const statusCode = isClientError ? err.statusCode : 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Server Error'
      : err.message || 'Server Error';

  res.status(statusCode).json({ message });
};
