import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  const isPrismaError = Boolean(
    err &&
      ((typeof err.name === 'string' && err.name.toLowerCase().startsWith('prisma')) ||
        /prisma/i.test(String(err.message || '')) ||
        /authentication failed/i.test(String(err.message || '')))
  );

  if (isPrismaError) {
    return res.status(503).json({ success: false, error: 'Database unavailable' });
  }

  const status = (err && typeof err === 'object' && ('statusCode' in err || 'status' in err))
    ? Number((err as { statusCode?: number; status?: number }).statusCode ?? (err as { status?: number }).status ?? 500)
    : 500;

  const message = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Internal server error';
  if (status >= 500) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }

  return res.status(status).json({ success: false, error: message });
};
