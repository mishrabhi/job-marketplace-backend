import winston from 'winston';
import env from './env';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.simple(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `[${timestamp}] ${level}: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: env.NODE_ENV === 'production' ? logFormat : devFormat,
  transports: [new winston.transports.Console()]
});

logger.payment = (paymentId, message, extra = {}) => {
  logger.info(message, { payment_id: paymentId, ...extra });
};

logger.failure = (paymentId, failureType, error, context = {}) => {
  logger.error(error?.message || `Failure type: ${failureType}`, {
    payment_id: paymentId,
    failure_type: failureType,
    error_stack: error?.stack,
    ...context
  });
};

export default logger;