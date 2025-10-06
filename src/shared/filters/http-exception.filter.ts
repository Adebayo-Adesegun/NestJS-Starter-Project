import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ErrorCodes, type ErrorResponseBody } from '../errors/error-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttp
      ? (exception as HttpException).getResponse()
      : 'Internal server error';

    let message: string | unknown = responseBody;
    let code = ErrorCodes.INTERNAL_ERROR;
    if (
      typeof responseBody === 'object' &&
      responseBody &&
      'message' in responseBody
    ) {
      // class-validator returns { message: string[] } or Nest may return { message: string }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rb: any = responseBody;
      message = rb.message ?? responseBody;
      code = rb.code ?? (status === 400 ? ErrorCodes.VALIDATION_FAILED : code);
    }

    const errorBody: ErrorResponseBody = {
      success: false,
      statusCode: status,
      code,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      message,
    };

    response.status(status).json(errorBody);
  }
}
