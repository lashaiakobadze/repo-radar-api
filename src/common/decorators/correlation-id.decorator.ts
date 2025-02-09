import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CORRELATION_HEADER_KEY = 'x-correlation-id';

export const CurrentCorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.headers[CORRELATION_HEADER_KEY];
  },
);
