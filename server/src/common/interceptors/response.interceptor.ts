import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 이미 형식이 맞춰진 응답은 그대로 반환
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // 기본 성공 응답 형식으로 래핑
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
