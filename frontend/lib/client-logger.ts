import { LogLevel } from './logger';

type LogPayload = {
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
};

export const clientLogger = {
  async log(level: LogLevel, message: string, data?: any, source?: string) {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          data,
          source,
        }),
      });
    } catch (error) {
      console.error('Failed to log to server:', error);
    }
  },

  info(message: string, data?: any, source?: string) {
    console.info(`[${source || 'client'}] ${message}`, data || '');
    return this.log(LogLevel.INFO, message, data, source);
  },

  warn(message: string, data?: any, source?: string) {
    console.warn(`[${source || 'client'}] ${message}`, data || '');
    return this.log(LogLevel.WARN, message, data, source);
  },

  error(message: string, data?: any, source?: string) {
    console.error(`[${source || 'client'}] ${message}`, data || '');
    return this.log(LogLevel.ERROR, message, data, source);
  },

  debug(message: string, data?: any, source?: string) {
    console.debug(`[${source || 'client'}] ${message}`, data || '');
    return this.log(LogLevel.DEBUG, message, data, source);
  },
};
