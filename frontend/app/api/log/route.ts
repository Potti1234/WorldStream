import { NextResponse } from 'next/server';
import { LogLevel, logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { level, message, data, source } = await request.json();
    
    // Validate log level
    if (!Object.values(LogLevel).includes(level)) {
      return NextResponse.json(
        { error: 'Invalid log level' },
        { status: 400 }
      );
    }

    // Log the message
    switch (level) {
      case LogLevel.INFO:
        logger.info(message, data, source);
        break;
      case LogLevel.WARN:
        logger.warn(message, data, source);
        break;
      case LogLevel.ERROR:
        logger.error(message, data, source);
        break;
      case LogLevel.DEBUG:
        logger.debug(message, data, source);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error processing log', { error }, 'api/log');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const logs = logger.getLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    logger.error('Error retrieving logs', { error }, 'api/log');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
