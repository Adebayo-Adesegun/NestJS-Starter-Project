import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * DateTransformInterceptor - Transforms Date objects to ISO 8601 strings in responses
 * 
 * This interceptor ensures that all Date objects in your API responses are
 * automatically converted to ISO 8601 UTC strings, maintaining consistency
 * across the application boundary.
 * 
 * Apply globally in main.ts:
 * ```typescript
 * app.useGlobalInterceptors(new DateTransformInterceptor());
 * ```
 * 
 * Or per controller/route:
 * ```typescript
 * @UseInterceptors(DateTransformInterceptor)
 * @Controller('events')
 * export class EventsController {}
 * ```
 */
@Injectable()
export class DateTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.transformDates(data))
    );
  }

  /**
   * Recursively transform all Date objects to ISO 8601 strings
   */
  private transformDates(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle Date objects
    if (data instanceof Date) {
      return data.toISOString();
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.transformDates(item));
    }

    // Handle objects
    if (typeof data === 'object' && data.constructor === Object) {
      const transformed: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          transformed[key] = this.transformDates(data[key]);
        }
      }
      return transformed;
    }

    // Return primitives as-is
    return data;
  }
}
