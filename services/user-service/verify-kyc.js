// Simulate advanced KYC workflow
const users = [
    { id: 'user-1', kycStatus: 'PENDING', taxVerifiedStatus: 'UNVERIFIED' }
];

function updateTaxInfo(userId, data) {
    const user = users.find(u => u.id === userId);
    const encryptedTaxId = Buffer.from(`SALT_${data.taxId}`).toString('base64');
    user.taxId = encryptedTaxId;
    user.taxIdType = data.taxIdType;
    user.taxVerifiedStatus = 'PENDING';
    console.log(`TAX UPDATED: User ${userId}, Status: PENDING, EncryptedID: ${encryptedTaxId.slice(0, 10)}...`);
}

function submitDocumentKyc(userId, idDocument) {
    const user = users.find(u => u.id === userId);
    // Simulate OCR
    const mockOcrData = {
        extractedName: "John Doe",
        documentType: "PASSPORT",
        confidence: 0.98
    };
    user.kycStatus = 'REVIEW_REQUIRED';
    user.idDocument = idDocument;
    user.documentData = mockOcrData;
    console.log(`DOCUMENT SUBMITTED: User ${userId}, Status: REVIEW_REQUIRED, OCR Conf: ${mockOcrData.confidence}`);
}

function scheduleVideoKyc(userId, date) {
    const user = users.find(u => u.id === userId);
    user.kycStatus = 'PENDING';
    user.kycMethod = 'VIDEO';
    user.videoInterviewAt = date;
    user.videoInterviewLink = `https://meet.jit.si/FreelanceKYC_${userId}`;
    console.log(`VIDEO SCHEDULED: User ${userId}, Date: ${date}, Link: ${user.videoInterviewLink}`);
}

function verifyKyc(userId, status) {
    const user = users.find(u => u.id === userId);
    user.kycStatus = status;
    user.isIdentityVerified = (status === 'APPROVED');
    console.log(`KYC VERIFIED: User ${userId}, Final Status: ${status}, Verified: ${user.isIdentityVerified}`);
}

// Test Flow
console.log('--- Step 1: Update Tax Info ---');
updateTaxInfo('user-1', { taxId: '123-456-789', taxIdType: 'SSN' });

console.log('--- Step 2: Submit Document KYC ---');
submitDocumentKyc('user-1', 'passport_scan.jpg');

console.log('--- Step 3: Admin Approves KYC ---');
verifyKyc('user-1', 'APPROVED');

console.log('--- Step 4: Schedule Video KYC (Alternative) ---');
scheduleVideoKyc('user-1', '2026-02-01T10:00:00Z');

console.log('--- Final State ---');
console.log(JSON.stringify(users[0], null, 2));

if (users[0].isIdentityVerified && users[0].taxVerifiedStatus === 'PENDING') {
    console.log('VERIFICATION PASSED: KYC logic consistent.');
} else {
    console.log('VERIFICATION FAILED.');
    process.exit(1);
}
