"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const update_auto_withdrawal_dto_1 = require("./dto/update-auto-withdrawal.dto");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    getExchangeRates(base) {
        return this.paymentsService.getExchangeRates(base);
    }
    updateCryptoAddress(req, address) {
        return this.paymentsService.updateCryptoAddress(req.user.sub, address);
    }
    updatePreferredCurrency(req, currency) {
        return this.paymentsService.updatePreferredCurrency(req.user.sub, currency);
    }
    getWalletMe(req) {
        return this.paymentsService.getWallet(req.user.sub);
    }
    getWallet(userId) {
        return this.paymentsService.getWallet(userId);
    }
    getPredictiveRevenue(userId) {
        return this.paymentsService.getPredictiveRevenue(userId);
    }
    deposit(body) {
        return this.paymentsService.deposit(body.userId, body.amount, body.referenceId);
    }
    withdraw(req, body) {
        return this.paymentsService.withdraw(req.user.sub, body.amount, body.instant || false);
    }
    getTransactions(req) {
        return this.paymentsService.getWallet(req.user.sub).then((wallet) => wallet.transactions);
    }
    addWithdrawalMethod(req, body) {
        return this.paymentsService.addWithdrawalMethod(req.user.sub, body);
    }
    getWithdrawalMethods(req) {
        return this.paymentsService.getWithdrawalMethods(req.user.sub);
    }
    deleteWithdrawalMethod(req, id) {
        return this.paymentsService.deleteWithdrawalMethod(req.user.sub, id);
    }
    updateAutoWithdrawal(req, body) {
        return this.paymentsService.updateAutoWithdrawalSettings(req.user.sub, body);
    }
    createTaxSetting(body) {
        return this.paymentsService.createTaxSetting(body);
    }
    findAllTaxSettings() {
        return this.paymentsService.getTaxSettings();
    }
    createSubscription(req, body) {
        return this.paymentsService.createSubscription(req.user.sub, body);
    }
    fundEscrow(req, body) {
        return this.paymentsService.fundEscrow(req.user.sub, body);
    }
    releaseEscrow(body) {
        return this.paymentsService.releaseEscrow(body.contractId, body.milestoneId, body.freelancerId);
    }
    refundEscrow(body) {
        return this.paymentsService.refundEscrow(body.contractId, body.milestoneId);
    }
    processPayroll(body) {
        return this.paymentsService.processPayroll(body.contractId, {
            ...body,
            periodStart: new Date(body.periodStart),
            periodEnd: new Date(body.periodEnd),
        });
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Get)('exchange-rates'),
    __param(0, (0, common_1.Query)('base')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getExchangeRates", null);
__decorate([
    (0, common_1.Patch)('wallet/crypto-address'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'realm:CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "updateCryptoAddress", null);
__decorate([
    (0, common_1.Patch)('wallet/currency'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'realm:CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "updatePreferredCurrency", null);
__decorate([
    (0, common_1.Get)('wallet'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getWalletMe", null);
__decorate([
    (0, common_1.Get)('wallet/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('revenue/predictive/:userId'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getPredictiveRevenue", null);
__decorate([
    (0, common_1.Post)('deposit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "deposit", null);
__decorate([
    (0, common_1.Post)('withdraw'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('methods'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "addWithdrawalMethod", null);
__decorate([
    (0, common_1.Get)('methods'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getWithdrawalMethods", null);
__decorate([
    (0, common_1.Delete)('methods/:id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "deleteWithdrawalMethod", null);
__decorate([
    (0, common_1.Patch)('auto-withdrawal'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_auto_withdrawal_dto_1.UpdateAutoWithdrawalDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "updateAutoWithdrawal", null);
__decorate([
    (0, common_1.Post)('tax-settings'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN', 'ADMIN'] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createTaxSetting", null);
__decorate([
    (0, common_1.Get)('tax-settings'),
    (0, nest_keycloak_connect_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findAllTaxSettings", null);
__decorate([
    (0, common_1.Post)('subscriptions'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Post)('escrow/fund'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "fundEscrow", null);
__decorate([
    (0, common_1.Post)('escrow/release'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT'] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "releaseEscrow", null);
__decorate([
    (0, common_1.Post)('escrow/refund'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN', 'ADMIN'] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "refundEscrow", null);
__decorate([
    (0, common_1.Post)('payroll/process'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN', 'ADMIN'] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "processPayroll", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('api/payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map