import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).details || null;
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 에러 로깅
    this.logger.error(
      `${request.method} ${request.url} - ${status} ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // 통일된 에러 응답 형식
    const errorResponse = {
      success: false,
      message,
      error: {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ...(details && { details }),
      },
    };

    // 개발 환경에서만 스택 트레이스 포함
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.error['stack'] = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}
