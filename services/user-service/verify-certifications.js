// Simulate Verified Skill Certifications and Trust Score logic
const users = [
    {
        id: 'user-1',
        isIdentityVerified: true,
        isPaymentVerified: false,
        isEmailVerified: true,
        certifications: [],
        trustScore: 0,
        badges: []
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

    user.trustScore = Math.min(100, score);
    console.log(`TRUST RECALCULATED: User ${userId}, New Score: ${user.trustScore}`);
}

function checkBadges(userId) {
    const user = users.find(u => u.id === userId);
    const newBadges = [];
    if (user.isIdentityVerified) newBadges.push('IDENTITY_VERIFIED');
    if (user.isPaymentVerified) newBadges.push('PAYMENT_VERIFIED');
    if (user.certifications.some(c => c.status === 'VERIFIED')) newBadges.push('SKILL_VERIFIED');

    user.badges = newBadges;
    console.log(`BADGES CHECKED: User ${userId}, Current Badges: ${newBadges.join(', ')}`);
}

function addCertification(userId, data) {
    const user = users.find(u => u.id === userId);
    const cert = { ...data, id: `cert-${Math.random()}`, status: 'PENDING' };
    user.certifications.push(cert);
    console.log(`CERT ADDED: ${cert.title} (Status: PENDING)`);
    return cert;
}

function verifyCertification(certId) {
    let foundCert;
    let userId;
    users.forEach(u => {
        const c = u.certifications.find(cert => cert.id === certId);
        if (c) {
            foundCert = c;
            userId = u.id;
        }
    });

    if (!foundCert) throw new Error('Cert not found');

    const isMockValid = foundCert.issuerId.startsWith('VERIFIED_');
    foundCert.status = isMockValid ? 'VERIFIED' : 'REJECTED';
    foundCert.verifiedAt = isMockValid ? new Date() : null;

    console.log(`CERT VERIFIED: ${foundCert.title}, Status: ${foundCert.status}`);

    checkBadges(userId);
    recalculateTrustScore(userId);
}

// Test Flow
console.log('--- Step 1: Initial Trust Score ---');
recalculateTrustScore('user-1'); // Should be 40 (Identity) + 10 (Email) = 50

console.log('--- Step 2: Add PENDING Certification ---');
const cert1 = addCertification('user-1', { title: 'AWS Cloud Practitioner', issuer: 'Credly', issuerId: 'BAD_ID_123' });
recalculateTrustScore('user-1'); // Should still be 50

console.log('--- Step 3: Verify Certification (Valid) ---');
cert1.issuerId = 'VERIFIED_AWS_123';
verifyCertification(cert1.id); // Should be 50 + 10 = 60. Badge: SKILL_VERIFIED

console.log('--- Step 4: Add and Verify 2nd Certification ---');
const cert2 = addCertification('user-1', { title: 'HackerRank React (Advanced)', issuer: 'HackerRank', issuerId: 'VERIFIED_HR_456' });
verifyCertification(cert2.id); // Should be 60 + 10 = 70.

console.log('--- Final State ---');
console.log(JSON.stringify(users[0], null, 2));

if (users[0].trustScore === 70 && users[0].badges.includes('SKILL_VERIFIED')) {
    console.log('VERIFICATION PASSED: Certification and Trust logic consistent.');
} else {
    console.log('VERIFICATION FAILED.');
    process.exit(1);
}
