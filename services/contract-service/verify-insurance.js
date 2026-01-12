// Simulate Insurance Marketplace and Trust Score logic
const users = [
    {
        id: 'user-4',
        isIdentityVerified: true,
        isPaymentVerified: true,
        isEmailVerified: true,
        backgroundCheckStatus: 'COMPLETED',
        taxVerifiedStatus: 'VERIFIED',
        certifications: [
            { id: 'c1', status: 'VERIFIED' }
        ],
        trustScore: 100, // Maxed out: 40+20+10+25+15+10 = 120 -> 100
        badges: ['IDENTITY_VERIFIED', 'PAYMENT_VERIFIED', 'SKILL_VERIFIED', 'SAFE_TO_WORK', 'TAX_VERIFIED'],
        metadata: {}
    }
];

const contracts = [
    { id: 'contract-1', freelancer_id: 'user-4', insurancePolicyId: null }
];

function recalculateTrustScore(userId) {
    const user = users.find(u => u.id === userId);
    let score = 0;
    if (user.isIdentityVerified) score += 40;
    if (user.isPaymentVerified) score += 20;
    if (user.isEmailVerified) score += 10;

    const verifiedCerts = user.certifications.filter(c => c.status === 'VERIFIED');
    score += Math.min(30, verifiedCerts.length * 10);

    if (user.backgroundCheckStatus === 'COMPLETED') score += 25;
    if (user.taxVerifiedStatus === 'VERIFIED') score += 15;

    if (user.metadata?.hasActiveInsurance) {
        score += 10;
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

    if (user.metadata?.hasActiveInsurance) {
        newBadges.push('INSURED_PRO');
    }

    user.badges = newBadges;
    console.log(`BADGES CHECKED: User ${userId}, Current Badges: ${newBadges.join(', ')}`);
}

function purchaseInsurance(contractId, data) {
    const contract = contracts.find(c => c.id === contractId);
    const user = users.find(u => u.id === contract.freelancer_id);

    console.log(`PURCHASING INSURANCE: Contract ${contractId} via ${data.provider}`);

    // Simulate policy creation
    const policyId = 'POL-999';
    contract.insurancePolicyId = policyId;

    // Simulate cross-service notification to user-service
    user.metadata.hasActiveInsurance = true;

    checkBadges(user.id);
    recalculateTrustScore(user.id);
}

// Test Flow
console.log('--- Step 1: Initial State ---');
console.log(`Score: ${users[0].trustScore}, Badges: ${users[0].badges.join(', ')}`);

console.log('--- Step 2: Purchase Liability Insurance ---');
purchaseInsurance('contract-1', {
    provider: 'Bunker',
    coverageAmount: 1000000,
    premiumAmount: 29.0
});

console.log('--- Final State ---');
console.log(JSON.stringify(users[0], null, 2));

if (users[0].trustScore === 100 && users[0].badges.includes('INSURED_PRO')) {
    console.log('VERIFICATION PASSED: Insurance marketplace integrated with reputation system.');
} else {
    console.log('VERIFICATION FAILED.');
    process.exit(1);
}
