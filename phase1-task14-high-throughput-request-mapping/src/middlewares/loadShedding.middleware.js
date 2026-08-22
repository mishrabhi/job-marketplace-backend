import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let activeInFlightRequests = 0;
let eventLoopLagMs = 0;

// Measure Node.js event-loop lag continuously[cite: 15]
let lastCheck = Date.now();
setInterval(() => {
  const now = Date.now();
  eventLoopLagMs = Math.max(0, now - lastCheck - 20); // Expected interval delta is 20ms
  lastCheck = now;
}, 20).unref();

export const loadShedder = (req, res, next) => {
  // 1. Check Event Loop Health & In-Flight Concurrency Bounds[cite: 15]
  const isEventLoopSaturated = eventLoopLagMs > env.EVENT_LOOP_MAX_LAG_MS;
  const isConcurrencyExceeded = activeInFlightRequests >= env.MAX_IN_FLIGHT_REQUESTS;

  if (isEventLoopSaturated || isConcurrencyExceeded) {
    logger.warn(`⚠️ [LOAD SHEDDING ENGAGED] Request rejected. EventLoopLag: ${eventLoopLagMs}ms, InFlight: ${activeInFlightRequests}`);
    
    res.setHeader('Retry-After', '2'); // Tell load balancers and clients to back off for 2s[cite: 15]
    return res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_OVERLOADED_LOAD_SHED',
        message: 'System is currently experiencing high load. Please retry in 2 seconds.'
      },
      telemetry: {
        event_loop_lag_ms: eventLoopLagMs,
        in_flight_requests: activeInFlightRequests
      },
      timestamp: new Date().toISOString()
    });
  }

  activeInFlightRequests++;

  // Ensure count decrements when response completes or aborts[cite: 15]
  res.on('finish', () => {
    activeInFlightRequests = Math.max(0, activeInFlightRequests - 1);
  });
  res.on('close', () => {
    activeInFlightRequests = Math.max(0, activeInFlightRequests - 1);
  });

  next();
};

export const getSystemTelemetry = () => ({
  active_in_flight_requests: activeInFlightRequests,
  event_loop_lag_ms: eventLoopLagMs,
  status: eventLoopLagMs > env.EVENT_LOOP_MAX_LAG_MS ? 'CRITICAL_SATURATION' : 'HEALTHY'
});