import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { ErrorCodes } from '../common/errors/error-codes';
import { JwtService } from '@nestjs/jwt';
import { User } from '../core/entities/user.entity';
import { UserService } from '../user/user.service';
import { RolesPermission } from '../core/entities/roles-permission.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from '../mailer/mailer.service';
import { ConfigService } from '@nestjs/config';
import { StrongPasswordValidator } from '../user/validator/strong-password.validator';
import { PasswordResetToken } from '../core/entities/password-reset-token.entity';
import { AuditLoggerService } from '../common/audit/audit-logger.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(RolesPermission)
    private readonly rolesPermissionRepository: Repository<RolesPermission>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly auditLogger: AuditLoggerService,
    @Optional() private readonly mailService?: MailService,
    @Optional() private readonly configService?: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: ['Authentication failed'],
        code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
      });
    }

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: ['Authentication failed'],
        code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
      });
    }

    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getPermissionsByRole(roleId: number): Promise<string[]> {
    const permissions = await this.rolesPermissionRepository
      .createQueryBuilder('rolePermission')
      .leftJoin('rolePermission.permission', 'permission')
      .where('rolePermission.roleId = :roleId', { roleId })
      .select('permission.name', 'name')
      .getRawMany();

    return permissions.map((permission) => permission.name);
  }

  /**
   * Send a password reset email with a persistent reset token stored in database.
   * Always return silently to avoid account enumeration.
   */
  async sendPasswordReset(email: string) {
    // Log the request before checking user existence (helps with audit trail)
    this.auditLogger.log('PASSWORD_RESET_REQUESTED', { email });

    const user = await this.userService.findOne({ where: { email } });

    if (!user) {
      // Do not reveal existence of account
      return;
    }

    // Generate a random token and hash it for storage
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresInMinutes =
      parseInt(
        this.configService?.get<string>('PASSWORD_RESET_EXPIRES_IN') || '60',
      ) || 60;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // Delete any prior unused tokens for this user
    await this.passwordResetTokenRepository.delete({
      userId: user.id,
      used: false,
    });

    // Create new reset token in database
    const resetToken = this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
    await this.passwordResetTokenRepository.save(resetToken);

    // Build reset link with token
    const frontendUrl = this.configService?.get<string>('FRONTEND_URL');
    const resetLink = frontendUrl
      ? `${frontendUrl}/reset-password?token=${token}`
      : token;

    try {
      await this.mailService?.send({
        to: user.email,
        subject: 'Password reset instructions',
        template: 'password-reset',
        context: {
          firstName: user.firstName || 'User',
          resetLink,
          expiresIn: expiresInMinutes,
        },
      });
    } catch (err) {
      Logger.error(`Failed to send reset email to ${email}: ${err?.message}`);
    }
  }

  /**
   * Reset password using a persistent reset token from database
   */
  async resetPassword(token: string, newPassword: string) {
    // Hash token to look up in database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    if (!resetToken) {
      this.auditLogger.log('PASSWORD_RESET_FAILURE', {
        reason: 'invalid_token',
      });
      throw new UnauthorizedException({
        statusCode: 401,
        message: ['Invalid or expired token'],
        code: ErrorCodes.AUTH_INVALID_TOKEN,
      });
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      this.auditLogger.log('PASSWORD_RESET_FAILURE', {
        reason: 'token_expired',
      });
      throw new UnauthorizedException({
        statusCode: 401,
        message: ['Invalid or expired token'],
        code: ErrorCodes.AUTH_INVALID_TOKEN,
      });
    }

    // Prevent token reuse
    if (resetToken.used) {
      this.auditLogger.log('PASSWORD_RESET_FAILURE', {
        reason: 'token_reused',
      });
      throw new UnauthorizedException({
        statusCode: 401,
        message: ['Token has already been used'],
        code: ErrorCodes.AUTH_INVALID_TOKEN,
      });
    }

    // Enforce strong password server-side
    const validator = new StrongPasswordValidator();
    if (!validator.validate(newPassword)) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['New password does not meet strength requirements'],
      });
    }

    const user = resetToken.user;
    if (!user) {
      this.auditLogger.log('PASSWORD_RESET_FAILURE', {
        reason: 'user_not_found',
      });
      throw new UnauthorizedException({
        statusCode: 401,
        message: ['Invalid token'],
        code: ErrorCodes.AUTH_INVALID_TOKEN,
      });
    }

    // Update password and set passwordChangedAt
    await this.userService.updatePassword(user.id, newPassword);

    // Mark token as used
    resetToken.used = true;
    resetToken.usedAt = new Date();
    await this.passwordResetTokenRepository.save(resetToken);

    // Log successful password reset
    this.auditLogger.log('PASSWORD_RESET_SUCCESS', { user_id: user.id });
    this.auditLogger.log('PASSWORD_RESET_TOKEN_USED', { user_id: user.id });
  }

  /**
   * Change password for authenticated users
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    this.auditLogger.log('PASSWORD_CHANGE_REQUESTED', { user_id: userId });

    const user = await this.userService.findOne({
      where: { id: userId } as any,
    });
    if (!user) {
      this.auditLogger.log('PASSWORD_CHANGE_FAILURE', {
        user_id: userId,
        reason: 'user_not_found',
      });
      throw new UnauthorizedException({
        statusCode: 401,
        message: ['Authentication failed'],
        code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
      });
    }

    const isValid = await user.checkPassword(currentPassword);
    if (!isValid) {
      this.auditLogger.log('PASSWORD_CHANGE_FAILURE', {
        user_id: userId,
        reason: 'invalid_current_password',
      });
      throw new UnauthorizedException({
        statusCode: 401,
        message: ['Current password is incorrect'],
        code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
      });
    }

    const validator = new StrongPasswordValidator();
    if (!validator.validate(newPassword)) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['New password does not meet strength requirements'],
      });
    }

    await this.userService.updatePassword(user.id, newPassword);

    // Log successful password change
    this.auditLogger.log('PASSWORD_CHANGE_SUCCESS', { user_id: userId });
  }
}
