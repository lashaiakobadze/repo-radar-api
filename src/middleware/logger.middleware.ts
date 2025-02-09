import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: Logger = new Logger(LoggerMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';

    const requestBody = this.getSanitizedBody(request);

    const startAt = process.hrtime();

    this.logger.debug(
      `Incoming request: ${method} ${originalUrl} ${ip} ${userAgent} - Body: ${requestBody}`,
    );

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const diff = process.hrtime(startAt);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${responseTime}ms ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }

  private getSanitizedBody(request: Request): string | null {
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      let requestBody: string | object = request.body;

      // Sanitize sensitive data (e.g., passwords or keys)
      if (requestBody && typeof requestBody === 'object') {
        const sanitizedBody: any = { ...requestBody };
        if (sanitizedBody?.password) sanitizedBody.password = '[REDACTED]';
        if (sanitizedBody.apiKey) sanitizedBody.apiKey = '[REDACTED]';

        requestBody = JSON.stringify(sanitizedBody);
      }

      if (typeof requestBody === 'string' && requestBody.length > 1000) {
        requestBody = `${requestBody.substring(0, 1000)}...`;
      }

      return requestBody;
    }

    // For GET, DELETE, and other methods without a body, return null
    return null;
  }
}
