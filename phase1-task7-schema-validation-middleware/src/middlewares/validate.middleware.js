import { ZodError } from 'zod';
import { appError } from './errorHandler.js';

/**
 * Higher-order middleware function to validate and sanitize request segments
 * @param {Object} schemas - Schema mapping: { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
 */
export const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      // Validate and sanitize Request Body
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      // Validate and sanitize Query Parameters
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      // Validate and sanitize URL Path Parameters
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Map structured field-level errors
        const formattedErrors = err.errors.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          rule: issue.code
        }));

        return next(appError(400, 'VALIDATION_ERROR', 'Request payload failed schema validation constraints.', formattedErrors));
      }
      next(err);
    }
  };
};