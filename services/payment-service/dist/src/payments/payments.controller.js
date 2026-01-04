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
    withdraw(body) {
        return this.paymentsService.withdraw(body.userId, body.amount);
    }
    getMyWithdrawalMethods(req) {
        return this.paymentsService.getWithdrawalMethods(req.user.sub);
    }
    addWithdrawalMethod(req, body) {
        return this.paymentsService.addWithdrawalMethod(req.user.sub, body);
    }
    deleteWithdrawalMethod(req, id) {
        return this.paymentsService.deleteWithdrawalMethod(req.user.sub, id);
    }
    setDefaultWithdrawalMethod(req, id) {
        return this.paymentsService.setDefaultWithdrawalMethod(req.user.sub, id);
    }
    getInvoice(id) {
        return this.paymentsService.getInvoiceData(id);
    }
    transfer(body) {
        return this.paymentsService.transfer(body.fromUserId, body.toUserId, body.amount, body.description, body.referenceId);
    }
    getTransactionsByReference(id) {
        return this.paymentsService.getTransactionsByReference(id);
    }
    getAllTransactions(limit, offset) {
        return this.paymentsService.getAllTransactions(limit, offset);
    }
    chargebackTransaction(id) {
        return this.paymentsService.processChargeback(id);
    }
    createTaxSetting(body) {
        return this.paymentsService.createTaxSetting(body);
    }
    getTaxSettings() {
        return this.paymentsService.getTaxSettings();
    }
    updateTaxSetting(id, body) {
        return this.paymentsService.updateTaxSetting(id, body);
    }
    getMyInvoices(req) {
        return this.paymentsService.getInvoices(req.user.sub);
    }
    async downloadInvoice(id, res) {
        const buffer = await this.paymentsService.generateInvoicePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
        });
        return new common_1.StreamableFile(buffer);
    }
    getEarningsStats(req, period = 'monthly') {
        return this.paymentsService.getEarningsStats(req.user.sub, period);
    }
    getSpendingStats(req, period = 'monthly') {
        return this.paymentsService.getSpendingStats(req.user.sub, period);
    }
    updateAutoWithdrawal(req, body) {
        return this.paymentsService.updateAutoWithdrawalSettings(req.user.sub, body);
    }
    getMetrics() {
        return this.paymentsService.getMetrics();
    }
    getMyPaymentMethods(req) {
        return this.paymentsService.getPaymentMethods(req.user.sub);
    }
    addPaymentMethod(req, body) {
        return this.paymentsService.addPaymentMethod(req.user.sub, body);
    }
    deletePaymentMethod(req, id) {
        return this.paymentsService.deletePaymentMethod(req.user.sub, id);
    }
    updateAutoDepositConfig(req, body) {
        return this.paymentsService.updateAutoDepositConfig(req.user.sub, body);
    }
    async getTaxDocument(req, year, res) {
        const buffer = await this.paymentsService.generateTaxDocumentPdf(req.user.sub, parseInt(year));
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="tax-summary-${year}.pdf"`,
        });
        return new common_1.StreamableFile(buffer);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
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
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'realm:CLIENT'] }),
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
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Get)('withdrawal-methods'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getMyWithdrawalMethods", null);
__decorate([
    (0, common_1.Post)('withdrawal-methods'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "addWithdrawalMethod", null);
__decorate([
    (0, common_1.Delete)('withdrawal-methods/:id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "deleteWithdrawalMethod", null);
__decorate([
    (0, common_1.Patch)('withdrawal-methods/:id/default'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "setDefaultWithdrawalMethod", null);
__decorate([
    (0, common_1.Get)('transactions/:id/invoice'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Post)('transfer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "transfer", null);
__decorate([
    (0, common_1.Get)('transactions/reference/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getTransactionsByReference", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getAllTransactions", null);
__decorate([
    (0, common_1.Post)('transactions/:id/chargeback'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "chargebackTransaction", null);
__decorate([
    (0, common_1.Post)('taxes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createTaxSetting", null);
__decorate([
    (0, common_1.Get)('taxes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getTaxSettings", null);
__decorate([
    (0, common_1.Put)('taxes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "updateTaxSetting", null);
__decorate([
    (0, common_1.Get)('invoices'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'realm:CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getMyInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/:id/download'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'realm:CLIENT'] }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "downloadInvoice", null);
__decorate([
    (0, common_1.Get)('earnings/stats'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'realm:CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getEarningsStats", null);
__decorate([
    (0, common_1.Get)('spending/stats'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getSpendingStats", null);
__decorate([
    (0, common_1.Patch)('wallet/auto-withdrawal'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_auto_withdrawal_dto_1.UpdateAutoWithdrawalDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "updateAutoWithdrawal", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('methods'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getMyPaymentMethods", null);
__decorate([
    (0, common_1.Post)('methods'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "addPaymentMethod", null);
__decorate([
    (0, common_1.Delete)('methods/:id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "deletePaymentMethod", null);
__decorate([
    (0, common_1.Post)('auto-deposit/config'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "updateAutoDepositConfig", null);
__decorate([
    (0, common_1.Get)('tax-documents/:year'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'realm:CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('year')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getTaxDocument", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('api/payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map