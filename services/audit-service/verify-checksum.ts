import * as crypto from 'crypto';

interface CreateAuditLogDto {
    service: string;
    eventType: string;
    actorId?: string;
    amount?: number;
    metadata?: any;
    referenceId?: string;
}

function generateChecksum(dto: CreateAuditLogDto, secret: string): string {
    const data = JSON.stringify({
        service: dto.service,
        eventType: dto.eventType,
        actorId: dto.actorId,
        amount: dto.amount,
        metadata: dto.metadata,
        referenceId: dto.referenceId,
        secret: secret,
    });
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Test Case 1: Identical data produces identical checksum
const dto1: CreateAuditLogDto = {
    service: 'payment-service',
    eventType: 'TRANSFER_COMPLETED',
    actorId: 'user-123',
    amount: 100.50,
    referenceId: 'ref-abc',
    metadata: { foo: 'bar' }
};

const secret = 'super-secret-integrity-key';
const hash1 = generateChecksum(dto1, secret);
const hash2 = generateChecksum({ ...dto1 }, secret);

console.log('Test 1 (Consistency):', hash1 === hash2 ? 'PASSED' : 'FAILED');

// Test Case 2: Tampering with metadata changes checksum
const dto2 = { ...dto1, metadata: { foo: 'tampered' } };
const hash3 = generateChecksum(dto2, secret);

console.log('Test 2 (Tamper Detection):', hash1 !== hash3 ? 'PASSED' : 'FAILED');

// Test Case 3: Changing amount changes checksum
const dto3 = { ...dto1, amount: 100.51 };
const hash4 = generateChecksum(dto3, secret);

console.log('Test 3 (Amount Precision Detection):', hash1 !== hash4 ? 'PASSED' : 'FAILED');

console.log('Verification Complete.');
