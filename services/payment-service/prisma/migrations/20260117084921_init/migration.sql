-- AlterTable
ALTER TABLE "payments"."Transaction" ADD COLUMN     "clearedAt" TIMESTAMP(3),
ADD COLUMN     "costCenter" TEXT,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "feeAmount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "payments"."Wallet" ADD COLUMN     "autoDepositAmount" DECIMAL(65,30),
ADD COLUMN     "autoDepositEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoDepositThreshold" DECIMAL(65,30),
ADD COLUMN     "autoWithdrawalEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoWithdrawalMethodId" TEXT,
ADD COLUMN     "autoWithdrawalSchedule" TEXT,
ADD COLUMN     "autoWithdrawalThreshold" DECIMAL(65,30),
ADD COLUMN     "cryptoAddress" TEXT,
ADD COLUMN     "paymentMethodId" TEXT,
ADD COLUMN     "pendingBalance" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
ADD COLUMN     "preferredCurrency" TEXT NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "payments"."WithdrawalMethod" ADD COLUMN     "isInstantCapable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "payments"."PaymentMethod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "last4" TEXT,
    "brand" TEXT,
    "token" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."PaymentApprovalRequest" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "feeAmount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."ConnectsHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."TaxSetting" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "taxRate" DECIMAL(65,30) NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "nextBillingDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."EscrowHold" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "costCenter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'HELD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscrowHold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentApprovalRequest_transactionId_key" ON "payments"."PaymentApprovalRequest"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "payments"."Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TaxSetting_countryCode_key" ON "payments"."TaxSetting"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowHold_transactionId_key" ON "payments"."EscrowHold"("transactionId");

-- AddForeignKey
ALTER TABLE "payments"."Transaction" ADD CONSTRAINT "Transaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "payments"."Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments"."PaymentApprovalRequest" ADD CONSTRAINT "PaymentApprovalRequest_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "payments"."Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
