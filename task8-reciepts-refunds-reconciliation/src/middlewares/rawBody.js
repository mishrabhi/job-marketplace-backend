import express from 'express';

/**
 * rawBody middleware — captures the raw request body as a Buffer.
 * Must be used on the webhook route INSTEAD of express.json().
 * Razorpay signature verification requires the exact raw bytes — once
 * parsed to JSON and re-serialised, byte order can differ and the HMAC will fail.
 */
export default rawBody = express.raw({ type: 'application/json' });

