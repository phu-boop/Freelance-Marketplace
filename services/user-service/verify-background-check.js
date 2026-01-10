// Simulate Background Check and Trust Score logic
const users = [
    {
        id: 'user-2',
        isIdentityVerified: true,
        isPaymentVerified: true,
        isEmailVerified: true,
        certifications: [
            { id: 'c1', status: 'VERIFIED' }
        ],
        backgroundCheckStatus: 'UNSTARTED',
        trustScore: 80, // 40 + 20 + 10 + 10
        badges: ['IDENTITY_VERIFIED', 'PAYMENT_VERIFIED', 'SKILL_VERIFIED']
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

    user.trustScore = Math.min(100, score);
    console.log(`TRUST RECALCULATED: User ${userId}, New Score: ${user.trustScore}`);
}

function checkBadges(userId) {
    const user = users.find(u => u.id === userId);
    const newBadges = [];
    if (user.isIdentityVerified) newBadges.push('IDENTITY_VERIFIED');
    if (user.isPaymentVerified) newBadges.push('PAYMENT_VERIFIED');
    if (user.certifications.some(c => c.status === 'VERIFIED')) newBadges.push('SKILL_VERIFIED');
    if (user.backgroundCheckStatus === 'COMPLETED') newBadges.push('SAFE_TO_WORK');

    user.badges = newBadges;
    console.log(`BADGES CHECKED: User ${userId}, Current Badges: ${newBadges.join(', ')}`);
}

function initiateBackgroundCheck(userId) {
    const user = users.find(u => u.id === userId);
    user.backgroundCheckStatus = 'PENDING';
    user.backgroundCheckId = `BCK_${userId}_${Date.now()}`;
    user.backgroundCheckUrl = `https://mock.io/portal/${user.backgroundCheckId}`;
    console.log(`BCK INITIATED: Status PENDING, ID: ${user.backgroundCheckId}`);
}

function verifyBackgroundCheck(userId, status) {
    const user = users.find(u => u.id === userId);
    user.backgroundCheckStatus = status;
    user.backgroundCheckVerifiedAt = status === 'COMPLETED' ? new Date() : null;

    console.log(`BCK VERIFIED: Status ${status}`);

    checkBadges(userId);
    recalculateTrustScore(userId);
}

// Test Flow
console.log('--- Step 1: Initial State ---');
console.log(`Score: ${users[0].trustScore}, Badges: ${users[0].badges.join(', ')}`);

console.log('--- Step 2: Initiate Background Check ---');
initiateBackgroundCheck('user-2');
recalculateTrustScore('user-2'); // Should remain 80

console.log('--- Step 3: Verify Background Check (COMPLETED) ---');
verifyBackgroundCheck('user-2', 'COMPLETED'); // Should be 80 + 25 = 105 -> capped at 100. Badge: SAFE_TO_WORK

console.log('--- Final State ---');
console.log(JSON.stringify(users[0], null, 2));

if (users[0].trustScore === 100 && users[0].badges.includes('SAFE_TO_WORK')) {
    console.log('VERIFICATION PASSED: Background check and Trust bonus consistent.');
} else {
    console.log('VERIFICATION FAILED.');
    process.exit(1);
}
