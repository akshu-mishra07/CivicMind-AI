import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = 'logs';

// Create the log directory if it does not exist
if (process.env.NODE_ENV === 'production' && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }: any) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const getTransports = () => {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    }),
  ];

  if (process.env.NODE_ENV === 'production') {
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          winston.format.json()
        ),
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.json()
        ),
      })
    );
  }

  return transports;
};

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    winston.format.json()
  ),
  transports: getTransports(),
  exitOnError: false,
});
