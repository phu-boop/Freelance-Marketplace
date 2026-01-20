import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AbacGuard implements CanActivate {
    private readonly logger = new Logger(AbacGuard.name);

    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const handler = context.getHandler();

        // Check for @AbacPolicy metadata (example)
        const policy = this.reflector.get<string>('abac_policy', handler);
        if (!policy) {
            return true; // No policy defined, proceed (or fallback to RBAC)
        }

        if (!user) {
            this.logger.warn('ABAC Check Failed: No user in request');
            return false;
        }

        // Mock Attribute Evaluation
        this.logger.log(`Evaluating ABAC Policy: ${policy} for User: ${user.sub}`);

        // Example Policy: 'OWN_RESOURCE_OR_ADMIN'
        if (policy === 'OWN_RESOURCE_OR_ADMIN') {
            const resourceId = request.params.id || request.body.id;
            const isAdmin = user.realm_access?.roles?.includes('ADMIN');
            const isOwner = resourceId && resourceId.startsWith(user.sub); // Mock ownership check

            if (isAdmin || isOwner) {
                return true;
            }
            this.logger.warn(`ABAC Deny: User ${user.sub} is not owner of ${resourceId} and not ADMIN`);
            return false;
        }

        // Example Policy: 'WORKING_HOURS_ONLY'
        if (policy === 'WORKING_HOURS_ONLY') {
            const hour = new Date().getHours();
            if (hour >= 9 && hour <= 17) {
                return true;
            }
            this.logger.warn(`ABAC Deny: Access allowed only between 9-17. Current: ${hour}`);
            return false;
        }

        return true;
    }
}
