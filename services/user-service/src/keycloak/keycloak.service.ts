import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as qs from 'querystring';

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);
  private readonly keycloakUrl: string;
  private readonly realm: string;
  private readonly adminUser: string;
  private readonly adminPass: string;
  private readonly clientSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.keycloakUrl = this.configService.get<string>(
      'KEYCLOAK_URL',
      'http://keycloak:8080',
    );
    this.realm = this.configService.get<string>(
      'KEYCLOAK_REALM',
      'freelance-marketplace',
    );
    this.adminUser = this.configService.get<string>(
      'KEYCLOAK_ADMIN_USER',
      'admin',
    );
    this.adminPass = this.configService.get<string>(
      'KEYCLOAK_ADMIN_PASSWORD',
      'admin',
    );
    this.clientSecret = this.configService.get<string>('KEYCLOAK_SECRET', '');
  }

  async login(credentials: { email: string; password: string }): Promise<any> {
    const url = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const clientId = this.configService.get<string>(
      'KEYCLOAK_CLIENT_ID',
      'freelance-frontend',
    );
    const clientSecret = this.configService.get<string>('KEYCLOAK_SECRET');

    const payload: any = {
      grant_type: 'password',
      client_id: clientId,
      username: credentials.email,
      password: credentials.password,
      scope: 'openid profile email',
    };

    if (clientSecret) {
      payload.client_secret = clientSecret;
    }

    const data = qs.stringify(payload);

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      const errorDescription = errorData?.error_description || error.message;

      this.logger.error(`Failed to login with Keycloak: ${errorDescription}`);

      if (errorDescription === 'Account is not fully set up') {
        throw new ForbiddenException(
          'Please verify your email address before logging in. Check your inbox (or MailHog locally).',
        );
      }

      if (
        status === 401 ||
        (status === 400 && errorData?.error === 'invalid_grant')
      ) {
        throw new UnauthorizedException('Invalid email or password');
      }
      throw new HttpException(
        errorDescription || 'Authentication failed',
        status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAdminToken(): Promise<string> {
    const url = `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`;
    const data = qs.stringify({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: this.adminUser,
      password: this.adminPass,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      return response.data.access_token;
    } catch (error) {
      this.logger.error(`Failed to get Keycloak admin token: ${error.message}`);
      throw error;
    }
  }

  async createUser(userData: {
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    role?: string;
  }): Promise<string> {
    const token = await this.getAdminToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users`;

    const userPayload = {
      email: userData.email,
      username: userData.username || userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      enabled: true,
      emailVerified: false,
      credentials: userData.password
        ? [
          {
            type: 'password',
            value: userData.password,
            temporary: false,
          },
        ]
        : [],
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, userPayload, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      // User ID is in the Location header
      const location = response.headers.location;
      const keycloakId = location.split('/').pop();

      if (userData.role) {
        await this.assignRole(keycloakId, userData.role);
      }

      // Trigger verification email (Non-blocking for dev/test)
      try {
        const verifyUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${keycloakId}/execute-actions-email`;
        await firstValueFrom(
          this.httpService.put(verifyUrl, ['VERIFY_EMAIL'], {
            headers: { Authorization: `Bearer ${token}` },
          }),
        );
      } catch (emailError) {
        this.logger.warn(
          `Failed to trigger verification email for ${keycloakId}: ${emailError.message}. Continuing...`,
        );
      }

      return keycloakId;
    } catch (error) {
      const status = error.response?.status;
      const errorMsg = error.response?.data?.errorMessage || error.message;
      this.logger.error(`Failed to create Keycloak user: ${errorMsg}`);

      if (status === 409) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw new HttpException(
        errorMsg || 'Failed to create user',
        status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendVerificationEmail(userId: string): Promise<void> {
    const token = await this.getAdminToken();
    const redirectUri = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000') + '/auth/verify-email';
    const clientId = this.configService.get<string>('KEYCLOAK_FRONTEND_CLIENT_ID', 'freelance-frontend');
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/execute-actions-email?redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${clientId}`;

    try {
      await firstValueFrom(
        this.httpService.put(url, ['VERIFY_EMAIL'], {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to send verification email for user ${userId}: ${error.message}`,
      );
      throw new HttpException(
        'Failed to send verification email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const token = await this.getAdminToken();
    // First find user by email
    const findUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/users?email=${email}`;
    try {
      const findResponse = await firstValueFrom(
        this.httpService.get(findUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      const users = findResponse.data;
      if (!users || users.length === 0) {
        // Return silently for security, or handle as needed
        this.logger.warn(
          `Password reset requested for non-existent email: ${email}`,
        );
        return;
      }
      const userId = users[0].id;

      // Trigger reset email
      const redirectUri = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const clientId = this.configService.get<string>('KEYCLOAK_FRONTEND_CLIENT_ID', 'freelance-frontend');
      const resetUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/execute-actions-email?redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${clientId}`;

      await firstValueFrom(
        this.httpService.put(resetUrl, ['UPDATE_PASSWORD'], {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to send password reset email: ${error.response?.data?.errorMessage || error.message}`,
      );
      throw new HttpException(
        'Failed to process password reset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const token = await this.getAdminToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/reset-password`;

    const payload = {
      type: 'password',
      value: newPassword,
      temporary: false,
    };

    try {
      await firstValueFrom(
        this.httpService.put(url, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );
    } catch (error) {
      const errorMsg = error.response?.data?.errorMessage || error.message;
      this.logger.error(
        `Failed to update Keycloak password for user ${userId}: ${errorMsg}`,
      );
      throw new HttpException(
        errorMsg || 'Failed to update password',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async enableTotp(userId: string, secret: string): Promise<void> {
    const token = await this.getAdminToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/credentials`;

    const payload = {
      type: 'otp',
      userLabel: 'Freelance Marketplace Authenticator',
      secretData: JSON.stringify({ value: secret }),
      credentialData: JSON.stringify({
        algorithm: 'HmacSHA1',
        digits: 6,
        counter: 0,
        period: 30,
      }),
    };

    // 1. Create OTP Credential
    try {
      this.logger.debug(`Attempting to enable TOTP for user ${userId} at ${url}`);
      await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to create OTP credential: ${error.message}`);
      if (error.response?.status === 404) {
        this.logger.warn(`OTP credentials endpoint not found (404). This Keycloak version might not support manual OTP setting via this endpoint.`);
        // Don't throw 500 if it's just a 404, we have local 2FA as backup
        return;
      }
      throw new HttpException(
        'Failed to enable 2FA in Keycloak',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 2. Mark OTP as required (update requiredActions or configure authentication execution)
    // For simplicity, we just leave it as handled by the credential presence.
    // Keycloak usually auto-enforces if OTP credential exists and flow requires it.
    // To be explicit, we can add 'CONFIGURE_TOTP' to required actions if not set up,
    // but here we are setting it up manually.
  }

  async disableTotp(userId: string): Promise<void> {
    const token = await this.getAdminToken();
    // 1. Get existing credentials
    const getUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/credentials`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(getUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      const credentials = response.data;
      const otpCred = credentials.find((c: any) => c.type === 'otp');

      if (otpCred) {
        // 2. Delete OTP Credential
        const deleteUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/credentials/${otpCred.id}`;
        await firstValueFrom(
          this.httpService.delete(deleteUrl, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        );
      }
    } catch (error) {
      this.logger.error(`Failed to disable TOTP: ${error.message}`);
      throw new HttpException(
        'Failed to disable 2FA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const token = await this.getAdminToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`;

    try {
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
    } catch (error) {
      if (error.response?.status !== 404) {
        this.logger.error(
          `Failed to delete Keycloak user ${userId}: ${error.message}`,
        );
        throw new HttpException(
          'Failed to delete user identity',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getUserById(userId: string): Promise<any> {
    const token = await this.getAdminToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get Keycloak user ${userId}: ${error.message}`,
      );
      return null;
    }
  }

  async getFederatedIdentities(userId: string): Promise<any[]> {
    const token = await this.getAdminToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/federated-identity`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get federated identities for user ${userId}: ${error.message}`,
      );
      return [];
    }
  }

  public async assignRole(userId: string, roleName: string) {
    const token = await this.getAdminToken();
    // First get the role representation
    const roleUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/roles/${roleName}`;
    try {
      const roleResponse = await firstValueFrom(
        this.httpService.get(roleUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      const role = roleResponse.data;

      // Assign role to user
      const assignUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`;
      await firstValueFrom(
        this.httpService.post(assignUrl, [role], {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to assign role ${roleName} to user ${userId}: ${error.message}`,
      );
    }
  }

  public async getUserRoles(userId: string): Promise<any[]> {
    const token = await this.getAdminToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get roles for user ${userId}: ${error.message}`,
      );
      return [];
    }
  }

  public async removeRoles(userId: string, roles: any[]) {
    if (!roles || roles.length === 0) return;
    const token = await this.getAdminToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`;
    try {
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
          data: roles,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove roles for user ${userId}: ${error.message}`,
      );
    }
  }

  async setUserEnabled(userId: string, enabled: boolean): Promise<void> {
    const token = await this.getAdminToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`;

    try {
      await firstValueFrom(
        this.httpService.put(
          url,
          { enabled },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );
    } catch (error) {
      this.logger.error(
        `Failed to update Keycloak user status for ${userId}: ${error.message}`,
      );
      throw new HttpException(
        'Failed to update user status in Keycloak',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
