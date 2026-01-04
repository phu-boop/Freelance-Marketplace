const crypto = require('crypto');

function generateChecksum(dto, secret) {
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
const dto1 = {
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

if (hash1 === hash2 && hash1 !== hash3 && hash1 !== hash4) {
    console.log('Verification Complete: ALL TESTS PASSED');
    process.exit(0);
} else {
    console.log('Verification Complete: SOME TESTS FAILED');
    process.exit(1);
}
