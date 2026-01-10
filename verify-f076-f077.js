const axios = require('axios');

async function verifyFeatures() {
    const PAYMENT_SERVICE_URL = 'http://localhost:3005/api/payments';
    const USER_SERVICE_URL = 'http://localhost:3001/api/users';

    // 1. Setup - Get a user (Freelancer)
    // Assuming a test user exists or we use the default from task.md
    const userId = '123e4567-e89b-12d3-a456-426614174000'; // Mock/Example

    console.log('--- Verifying F-076: Instant Pay ---');
    try {
        // Add a withdrawal method
        const methodRes = await axios.post(`${PAYMENT_SERVICE_URL}/withdrawal-methods`, {
            type: 'DEBIT_CARD',
            accountNumber: '**** **** **** 1234',
            accountName: 'John Doe',
            isDefault: true
        });
        const methodId = methodRes.data.id;
        console.log(`Added withdrawal method: ${methodId}`);

        // Verify instant capability
        await axios.post(`${PAYMENT_SERVICE_URL}/withdrawal-methods/${methodId}/verify-instant`);
        console.log('Verified instant pay capability');

        // Deposit some funds first to test withdrawal
        await axios.post(`${PAYMENT_SERVICE_URL}/deposit`, {
            userId,
            amount: 1000,
            referenceId: 'REF_INITIAL'
        });

        // Trigger Instant Withdrawal
        const withdrawRes = await axios.post(`${PAYMENT_SERVICE_URL}/withdraw`, {
            userId,
            amount: 100,
            instant: true
        });
        console.log('Instant Withdrawal Response:', withdrawRes.data);
        // Should have $100 amount + $2.00 fee (max(1.5, 2.0))

    } catch (err) {
        console.error('Instant Pay Verification Failed:', err.response?.data || err.message);
    }

    console.log('\n--- Verifying F-077: Subscriptions & Tier Sync ---');
    try {
        const planId = 'PLUS';
        const price = 14.99;

        // Upgrade Subscription via User Service
        console.log(`Upgrading user ${userId} to ${planId}...`);
        await axios.post(`${USER_SERVICE_URL}/me/subscription`, { planId });

        // Check User status
        const userRes = await axios.get(`${USER_SERVICE_URL}/${userId}`);
        console.log(`User Tier: ${userRes.data.subscriptionTier}`);
        console.log(`User Badges: ${userRes.data.badges.join(', ')}`);
        console.log(`User Trust Score: ${userRes.data.trustScore}`);

        if (userRes.data.subscriptionTier === 'PLUS' && userRes.data.badges.includes('PLUS_MEMBER')) {
            console.log('Subscription & Tier Sync Verified!');
        } else {
            console.log('Verification Mismatch!');
        }

    } catch (err) {
        console.error('Subscription Verification Failed:', err.response?.data || err.message);
    }
}

verifyFeatures();
