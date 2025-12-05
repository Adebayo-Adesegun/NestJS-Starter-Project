import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Password validator that enforces strong password requirements
 * Requirements:
 * - Minimum 12 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
@ValidatorConstraint({ name: 'strongPassword' })
export class StrongPasswordValidator implements ValidatorConstraintInterface {
  validate(password: string): boolean {
    if (!password || password.length < 12) {
      return false;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password,
    );

    return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  }

  defaultMessage(): string {
    return 'Password must be at least 12 characters and contain: uppercase letter, lowercase letter, number, and special character (!@#$%^&*)';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: StrongPasswordValidator,
    });
  };
}
