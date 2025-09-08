import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
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
    let validationErrors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).details || null;

        // ValidationPipe 에러 처리 개선
        if (exception instanceof BadRequestException && Array.isArray((exceptionResponse as any).message)) {
          validationErrors = (exceptionResponse as any).message;
          message = '입력 데이터 검증에 실패했습니다.';
        }
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 에러 로깅 개선
    this.logger.error(`${request.method} ${request.url} - ${status} ${message}`, {
      status,
      message,
      validationErrors,
      details,
      stack: exception instanceof Error ? exception.stack : undefined,
      body: request.body,
      query: request.query,
      params: request.params,
    });

    // 상세한 에러 응답 구성
    const errorResponse = {
      success: false,
      message,
      error: {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ...(validationErrors.length > 0 && {
          validationErrors: this.formatValidationErrors(validationErrors),
        }),
        ...(details && { details }),
      },
    };

    // 개발 환경에서만 스택 트레이스 포함
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.error['stack'] = exception.stack;
      errorResponse.error['originalError'] = exception.message;
    }

    response.status(status).json(errorResponse);
  }

  /**
   * 검증 에러를 사용자 친화적 형태로 변환
   */
  private formatValidationErrors(errors: any[]): any[] {
    return errors.map((error) => {
      if (typeof error === 'string') {
        return { message: error };
      }

      if (error.property && error.constraints) {
        return {
          field: error.property,
          value: error.value,
          errors: Object.values(error.constraints),
        };
      }

      return error;
    });
  }
}