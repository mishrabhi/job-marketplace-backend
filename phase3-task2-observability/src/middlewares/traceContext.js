import crypto from 'crypto';

/**
 * Simulates an OpenTelemetry distributed context propagation injector middleware
 */
export const traceContextInjector = (req, res, next) => {
  // Capture upstream contexts or establish atomic local tracking tokens
  req.traceId = req.headers['x-trace-id'] || crypto.randomBytes(16).toString('hex');
  req.spanId = crypto.randomBytes(8).toString('hex');
  req.parentSpanId = req.headers['x-parent-span-id'] || null;

  res.setHeader('X-Trace-Id', req.traceId);
  res.setHeader('X-Span-Id', req.spanId);

  next();
};