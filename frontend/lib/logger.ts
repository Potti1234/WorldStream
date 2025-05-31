export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  source?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private addLog(level: LogLevel, message: string, data?: any, source?: string) {
    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source
    };

    // Log to console
    const logMethod = level === LogLevel.ERROR ? console.error :
                    level === LogLevel.WARN ? console.warn :
                    level === LogLevel.DEBUG ? console.debug : console.log;
    
    logMethod(`[${logEntry.timestamp}] [${level}] ${source ? `[${source}] ` : ''}${message}`, data || '');

    // Add to in-memory logs
    this.logs.push(logEntry);
    
    // Maintain max logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  public info(message: string, data?: any, source?: string) {
    this.addLog(LogLevel.INFO, message, data, source);
  }

  public warn(message: string, data?: any, source?: string) {
    this.addLog(LogLevel.WARN, message, data, source);
  }

  public error(message: string, data?: any, source?: string) {
    this.addLog(LogLevel.ERROR, message, data, source);
  }

  public debug(message: string, data?: any, source?: string) {
    this.addLog(LogLevel.DEBUG, message, data, source);
  }

  public getLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }
}

export const logger = Logger.getInstance();
