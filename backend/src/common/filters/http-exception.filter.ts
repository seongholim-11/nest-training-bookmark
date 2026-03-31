import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException) // 오직 HttpException 관련 에러만 잡아냅니다.
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // 에러 메시지가 문자열일 수도, 객체(Validation 에러 등)일 수도 있습니다.
    const message =
      typeof errorResponse === 'object'
        ? (errorResponse as any).message || errorResponse
        : errorResponse;

    // 우리가 정의한 표준 에러 포맷으로 응답을 보냅니다.
    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
