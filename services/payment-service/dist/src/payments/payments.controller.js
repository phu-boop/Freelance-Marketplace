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
const currency_service_1 = require("./currency.service");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const payments_service_1 = require("./payments.service");
const list_transactions_dto_1 = require("./dto/list-transactions.dto");
const update_transaction_status_dto_1 = require("./dto/update-transaction-status.dto");
const update_auto_withdrawal_dto_1 = require("./dto/update-auto-withdrawal.dto");
let PaymentsController = class PaymentsController {
    paymentsService;
    currencyService;
    constructor(paymentsService, currencyService) {
        this.paymentsService = paymentsService;
        this.currencyService = currencyService;
    }
    getExchangeRates(base) {
        return this.paymentsService.getExchangeRates(base);
    }
    async convertCurrency(amount, from, to) {
        const converted = await this.currencyService.convert(Number(amount), from, to);
        const formatted = await this.currencyService.format(converted, to);
        return { amount: converted, formatted, currency: to };
    }
    getMetrics() {
        return this.paymentsService.getMetrics();
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
    getAgencyRevenue(id) {
        return this.paymentsService.getAgencyRevenue(id);
    }
    getAgencyWallet(agencyId) {
        return this.paymentsService.getWallet(agencyId);
    }
    getAgencyTransactions(agencyId, query) {
        return this.paymentsService.listTransactions(agencyId, query);
    }
    withdrawAgency(req, body) {
        return this.paymentsService.withdraw(body.agencyId, body.amount, body.instant || false);
    }
    getConnectsBalance(req) {
        return this.paymentsService.getConnectsBalance(req.user.sub);
    }
    buyConnects(req, amount) {
        return this.paymentsService.buyConnects(req.user.sub, amount);
    }
    purchaseConnects(req, body) {
        return this.paymentsService.purchaseConnects(req.user.sub, body.bundleId);
    }
    getConnectsHistory(req) {
        return this.paymentsService.getConnectsHistory(req.user.sub);
    }
    rewardConnects(body) {
        return this.paymentsService.rewardConnects(body.userId, body.amount, body.reason);
    }
    deductConnects(body) {
        return this.paymentsService.deductConnects(body.userId, body.amount, body.reason);
    }
    refundConnects(body) {
        return this.paymentsService.refundConnects(body.userId, body.amount, body.reason);
    }
    deposit(body) {
        return this.paymentsService.deposit(body.userId, body.amount, body.referenceId);
    }
    withdraw(req, body) {
        return this.paymentsService.withdraw(req.user.sub, body.amount, body.instant || false);
    }
    async getTransactions(query, req) {
        return this.paymentsService.listTransactions(req.user.sub, query);
    }
    async getTransactionsByReference(referenceId, req) {
        return this.paymentsService.getTransactionsByReference(referenceId);
    }
    async getTransaction(id, req) {
        const roles = req.user?.realm_access?.roles || [];
        const isAdmin = roles.includes('ADMIN');
        return this.paymentsService.getTransactionById(id, req.user?.sub, isAdmin);
    }
    async approveTransaction(id, req) {
        const userId = req.user.sub;
        const roles = req.user.realm_access?.roles || [];
        return this.paymentsService.approvePayment(id, userId, roles);
    }
    async updateTransactionStatus(id, body, req) {
        return this.paymentsService.updateTransactionStatus(id, body.status, req.user?.sub || 'admin');
    }
    async getAllTransactionsAdmin(query) {
        return this.paymentsService.listTransactions(undefined, query);
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
        return this.paymentsService.manageSubscription(req.user.sub, body.planId, body.price);
    }
    getSubscription(req) {
        return this.paymentsService.getSubscription(req.user.sub);
    }
    fundEscrow(req, body) {
        return this.paymentsService.fundEscrow(req.user.sub, body);
    }
    releaseEscrow(body) {
        return this.paymentsService.releaseEscrow(body.contractId, body.milestoneId, body.freelancerId, body.agencyId, body.agencyRevenueSplit);
    }
    requestEscrowApproval(body) {
        return this.paymentsService.requestEscrowReleaseApproval(body.contractId, body.milestoneId, body.freelancerId, body.amount);
    }
    splitEscrowRelease(body) {
        return this.paymentsService.splitEscrowRelease(body.contractId, body.milestoneId, body.freelancerId, body.freelancerPercentage);
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
    previewPayroll(contractId, grossAmount, employeeId) {
        return this.paymentsService.calculatePayroll(contractId, Number(grossAmount), employeeId);
    }
    transfer(body) {
        return this.paymentsService.transfer(body.fromUserId, body.toUserId, body.amount, body.description, body.referenceId, body.teamId, body.departmentId, body.costCenter);
    }
    deductArbitrationFee(body) {
        return this.paymentsService.deductArbitrationFee(body.userId, body.amount, body.contractId);
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
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Get)('currency/convert'),
    __param(0, (0, common_1.Query)('amount')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "convertCurrency", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN', 'ADMIN'] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getMetrics", null);
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
    (0, nest_keycloak_connect_1.Roles)({
        roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
    }),
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
    (0, common_1.Get)('agency/:id/revenue'),
    (0, nest_keycloak_connect_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getAgencyRevenue", null);
__decorate([
    (0, common_1.Get)('wallet/agency/:agencyId'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Param)('agencyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getAgencyWallet", null);
__decorate([
    (0, common_1.Get)('transactions/agency/:agencyId'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Param)('agencyId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, list_transactions_dto_1.ListTransactionsDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getAgencyTransactions", null);
__decorate([
    (0, common_1.Post)('withdraw/agency'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "withdrawAgency", null);
__decorate([
    (0, common_1.Get)('connects/balance'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getConnectsBalance", null);
__decorate([
    (0, common_1.Post)('connects/buy'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "buyConnects", null);
__decorate([
    (0, common_1.Post)('connects/purchase'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "purchaseConnects", null);
__decorate([
    (0, common_1.Get)('connects/history'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getConnectsHistory", null);
__decorate([
    (0, common_1.Post)('connects/reward'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN', 'ADMIN'] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "rewardConnects", null);
__decorate([
    (0, common_1.Post)('connects/deduct'),
    (0, nest_keycloak_connect_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "deductConnects", null);
__decorate([
    (0, common_1.Post)('connects/refund'),
    (0, nest_keycloak_connect_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "refundConnects", null);
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
    (0, nest_keycloak_connect_1.Roles)({
        roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
    }),
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_transactions_dto_1.ListTransactionsDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getTransactions", null);
__decorate([
    (0, nest_keycloak_connect_1.Roles)({
        roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
    }),
    (0, common_1.Get)('transactions/reference/:referenceId'),
    __param(0, (0, common_1.Param)('referenceId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getTransactionsByReference", null);
__decorate([
    (0, nest_keycloak_connect_1.Roles)({
        roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
    }),
    (0, common_1.Get)('transactions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getTransaction", null);
__decorate([
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN', 'ADMIN', 'realm:MANAGER', 'MANAGER', 'realm:FINANCE', 'FINANCE'] }),
    (0, common_1.Post)('transactions/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "approveTransaction", null);
__decorate([
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN', 'ADMIN'] }),
    (0, common_1.Patch)('transactions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_transaction_status_dto_1.UpdateTransactionStatusDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "updateTransactionStatus", null);
__decorate([
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN', 'ADMIN'] }),
    (0, common_1.Get)('admin/transactions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_transactions_dto_1.ListTransactionsDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getAllTransactionsAdmin", null);
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
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Get)('subscriptions/me'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getSubscription", null);
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
    (0, common_1.Post)('escrow/request-approval'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT'] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "requestEscrowApproval", null);
__decorate([
    (0, common_1.Post)('escrow/split-release'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN', 'ADMIN'] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "splitEscrowRelease", null);
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
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN', 'ADMIN', 'realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "processPayroll", null);
__decorate([
    (0, common_1.Get)('payroll/preview'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN', 'ADMIN', 'realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Query)('contractId')),
    __param(1, (0, common_1.Query)('grossAmount')),
    __param(2, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "previewPayroll", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, nest_keycloak_connect_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)('arbitration/deduct'),
    (0, nest_keycloak_connect_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "deductArbitrationFee", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('api/payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        currency_service_1.CurrencyService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map