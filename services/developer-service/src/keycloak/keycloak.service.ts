import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
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

    async createClient(clientData: {
        clientId: string;
        name: string;
        redirectUris: string[];
    }): Promise<any> {
        const token = await this.getAdminToken();
        const url = `${this.keycloakUrl}/admin/realms/${this.realm}/clients`;

        const payload = {
            clientId: clientData.clientId,
            name: clientData.name,
            enabled: true,
            protocol: 'openid-connect',
            publicClient: false,
            secret: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            redirectUris: clientData.redirectUris,
            serviceAccountsEnabled: true,
            authorizationServicesEnabled: true,
        };

        try {
            await firstValueFrom(
                this.httpService.post(url, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            );

            // Get the client secret (payload.secret is what we sent, but it's better to fetch the official representation)
            return payload;
        } catch (error) {
            const status = error.response?.status;
            const errorMsg = error.response?.data?.errorMessage || error.message;
            this.logger.error(`Failed to create Keycloak client: ${errorMsg}`);
            throw new HttpException(errorMsg || 'Failed to create client', status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getClientSecret(id: string): Promise<string> {
        const token = await this.getAdminToken();
        const url = `${this.keycloakUrl}/admin/realms/${this.realm}/clients/${id}/client-secret`;

        try {
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            );
            return response.data.value;
        } catch (error) {
            this.logger.error(`Failed to get Keycloak client secret: ${error.message}`);
            throw error;
        }
    }

    async getClientById(clientId: string): Promise<any> {
        const token = await this.getAdminToken();
        const url = `${this.keycloakUrl}/admin/realms/${this.realm}/clients?clientId=${clientId}`;

        try {
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            );
            return response.data[0];
        } catch (error) {
            this.logger.error(`Failed to fetch client info: ${error.message}`);
            return null;
        }
    }
}
