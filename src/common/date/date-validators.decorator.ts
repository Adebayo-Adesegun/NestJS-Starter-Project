import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator to ensure date strings are in ISO 8601 format with timezone
 */
@ValidatorConstraint({ name: 'isISO8601WithTimezone', async: false })
export class IsISO8601WithTimezoneConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    // Regex to match ISO 8601 with timezone (Z or ±HH:MM)
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;

    if (!iso8601Regex.test(value)) {
      return false;
    }

    // Verify it's a valid date
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid ISO 8601 date string with timezone information (e.g., "2026-01-19T10:30:00Z" or "2026-01-19T10:30:00+05:30")`;
  }
}

/**
 * Decorator to validate ISO 8601 dates with timezone
 * Use this instead of @IsISO8601() to enforce timezone requirement
 * 
 * @example
 * ```typescript
 * class CreateEventDto {
 *   @IsISO8601WithTimezone()
 *   startDate: string;
 * }
 * ```
 */
export function IsISO8601WithTimezone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsISO8601WithTimezoneConstraint,
    });
  };
}

/**
 * Validator for date ranges (ensures endDate is after startDate)
 */
@ValidatorConstraint({ name: 'isAfterDate', async: false })
export class IsAfterDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];

    if (!value || !relatedValue) {
      return false;
    }

    const currentDate = new Date(value);
    const comparisonDate = new Date(relatedValue);

    if (isNaN(currentDate.getTime()) || isNaN(comparisonDate.getTime())) {
      return false;
    }

    return currentDate.getTime() > comparisonDate.getTime();
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} must be after ${relatedPropertyName}`;
  }
}

/**
 * Decorator to validate that a date is after another date
 * 
 * @param property - Name of the property to compare against
 * @param validationOptions - Validation options
 * 
 * @example
 * ```typescript
 * class CreateEventDto {
 *   @IsISO8601WithTimezone()
 *   startDate: string;
 * 
 *   @IsISO8601WithTimezone()
 *   @IsAfterDate('startDate')
 *   endDate: string;
 * }
 * ```
 */
export function IsAfterDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsAfterDateConstraint,
    });
  };
}

/**
 * Validator for dates not in the past
 */
@ValidatorConstraint({ name: 'isNotPastDate', async: false })
export class IsNotPastDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!value) {
      return false;
    }

    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return false;
    }

    return date.getTime() >= Date.now();
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} cannot be in the past`;
  }
}

/**
 * Decorator to validate that a date is not in the past
 * 
 * @example
 * ```typescript
 * class CreateEventDto {
 *   @IsISO8601WithTimezone()
 *   @IsNotPastDate()
 *   eventDate: string;
 * }
 * ```
 */
export function IsNotPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotPastDateConstraint,
    });
  };
}
