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
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    getWalletMe(req) {
        return this.paymentsService.getWallet(req.user.sub);
    }
    getWallet(userId) {
        return this.paymentsService.getWallet(userId);
    }
    deposit(body) {
        return this.paymentsService.deposit(body.userId, body.amount, body.referenceId);
    }
    withdraw(body) {
        return this.paymentsService.withdraw(body.userId, body.amount);
    }
    getWithdrawalMethods(userId) {
        return this.paymentsService.getWithdrawalMethods(userId);
    }
    addWithdrawalMethod(body) {
        return this.paymentsService.addWithdrawalMethod(body.userId, body.data);
    }
    deleteWithdrawalMethod(userId, id) {
        return this.paymentsService.deleteWithdrawalMethod(userId, id);
    }
    setDefaultWithdrawalMethod(userId, id) {
        return this.paymentsService.setDefaultWithdrawalMethod(userId, id);
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
    getMetrics() {
        return this.paymentsService.getMetrics();
    }
};
exports.PaymentsController = PaymentsController;
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
    (0, common_1.Get)('withdrawal-methods/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getWithdrawalMethods", null);
__decorate([
    (0, common_1.Post)('withdrawal-methods'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "addWithdrawalMethod", null);
__decorate([
    (0, common_1.Delete)('withdrawal-methods/:userId/:id'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "deleteWithdrawalMethod", null);
__decorate([
    (0, common_1.Patch)('withdrawal-methods/:userId/:id/default'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
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
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getMetrics", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)(''),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map