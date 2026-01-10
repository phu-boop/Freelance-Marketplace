// Simulate Digital Tax Compliance and Trust Score logic
const users = [
    {
        id: 'user-3',
        isIdentityVerified: true,
        isPaymentVerified: true,
        isEmailVerified: true,
        backgroundCheckStatus: 'COMPLETED',
        certifications: [
            { id: 'c1', status: 'VERIFIED' }
        ],
        taxVerifiedStatus: 'UNVERIFIED',
        trustScore: 95, // 40 + 20 + 10 + 25 (BCK) + 10 (Cert) -> capped at 100
        badges: ['IDENTITY_VERIFIED', 'PAYMENT_VERIFIED', 'SAFE_TO_WORK', 'SKILL_VERIFIED']
    }
];

function recalculateTrustScore(userId) {
    const user = users.find(u => u.id === userId);
    let score = 0;
    if (user.isIdentityVerified) score += 40;
    if (user.isPaymentVerified) score += 20;
    if (user.isEmailVerified) score += 10;

    const verifiedCerts = user.certifications.filter(c => c.status === 'VERIFIED');
    score += Math.min(30, verifiedCerts.length * 10);

    if (user.backgroundCheckStatus === 'COMPLETED') {
        score += 25;
    }

    if (user.taxVerifiedStatus === 'VERIFIED') {
        score += 15;
    }

    user.trustScore = Math.min(100, score);
    console.log(`TRUST RECALCULATED: User ${userId}, New Score: ${user.trustScore} (Raw: ${score})`);
}

function checkBadges(userId) {
    const user = users.find(u => u.id === userId);
    const newBadges = [];
    if (user.isIdentityVerified) newBadges.push('IDENTITY_VERIFIED');
    if (user.isPaymentVerified) newBadges.push('PAYMENT_VERIFIED');
    if (user.certifications.some(c => c.status === 'VERIFIED')) newBadges.push('SKILL_VERIFIED');
    if (user.backgroundCheckStatus === 'COMPLETED') newBadges.push('SAFE_TO_WORK');
    if (user.taxVerifiedStatus === 'VERIFIED') newBadges.push('TAX_VERIFIED');

    user.badges = newBadges;
    console.log(`BADGES CHECKED: User ${userId}, Current Badges: ${newBadges.join(', ')}`);
}

function submitTaxForm(userId, data) {
    const user = users.find(u => u.id === userId);

    // Simulate encryption
    user.taxId = Buffer.from(`SALT_${data.taxId}`).toString('base64');
    user.taxIdType = data.taxIdType;
    user.taxFormType = data.taxFormType;
    user.taxSignatureName = data.taxSignatureName;
    user.taxSignatureIp = data.taxSignatureIp;
    user.taxSignatureDate = new Date();
    user.billingAddress = data.billingAddress;
    user.taxVerifiedStatus = 'VERIFIED';

    console.log(`TAX FORM SUBMITTED: Form ${data.taxFormType}, Signed by: ${data.taxSignatureName}`);

    checkBadges(userId);
    recalculateTrustScore(userId);
}

// Test Flow
console.log('--- Step 1: Initial State ---');
console.log(`Score: ${users[0].trustScore}, Badges: ${users[0].badges.join(', ')}`);

console.log('--- Step 2: Submit W-8BEN Tax Form ---');
submitTaxForm('user-3', {
    taxId: 'TAX123456',
    taxIdType: 'VAT',
    taxFormType: 'W8BEN',
    taxSignatureName: 'John Doe',
    taxSignatureIp: '192.168.1.1',
    billingAddress: '123 Fake St, London, UK'
});

console.log('--- Final State ---');
console.log(JSON.stringify(users[0], null, 2));

if (users[0].trustScore === 100 && users[0].badges.includes('TAX_VERIFIED')) {
    console.log('VERIFICATION PASSED: Tax compliance and Trust bonus consistent.');
} else {
    console.log('VERIFICATION FAILED.');
    process.exit(1);
}
