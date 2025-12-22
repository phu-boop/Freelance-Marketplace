import { Injectable, Logger } from '@nestjs/common';
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

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.keycloakUrl = this.configService.get<string>('KEYCLOAK_URL', 'http://keycloak:8080');
        this.realm = this.configService.get<string>('KEYCLOAK_REALM', 'freelance-marketplace');
        this.adminUser = this.configService.get<string>('KEYCLOAK_ADMIN_USER', 'admin');
        this.adminPass = this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD', 'admin');
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
            credentials: userData.password ? [
                {
                    type: 'password',
                    value: userData.password,
                    temporary: false,
                }
            ] : [],
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
                await this.assignRole(keycloakId, userData.role, token);
            }

            return keycloakId;
        } catch (error) {
            this.logger.error(`Failed to create Keycloak user: ${error.response?.data?.errorMessage || error.message}`);
            throw error;
        }
    }

    private async assignRole(userId: string, roleName: string, token: string) {
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
            this.logger.error(`Failed to assign role ${roleName} to user ${userId}: ${error.message}`);
        }
    }
}
