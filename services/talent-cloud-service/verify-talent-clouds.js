const axios = require('axios');

// Configure URLs - Using localhost ports as we run this from host
const USER_SERVICE_URL = 'http://localhost:3001';
const TALENT_CLOUD_SERVICE_URL = 'http://localhost:3017';

async function verifyTalentClouds() {
    console.log('--- Talent Cloud Verification Started ---');

    try {
        // 1. Create a mock freelancer in user-service
        console.log('1. Creating mock freelancer...');
        const freelancerResponse = await axios.post(`${USER_SERVICE_URL}/api/users`, {
            email: `freelancer_${Date.now()}@example.com`,
            firstName: 'Alice',
            lastName: 'Freelancer',
            roles: ['FREELANCER'],
            isEmailVerified: true // Gives 10 points
        });
        const freelancer = freelancerResponse.data;
        console.log(`Freelancer created: ${freelancer.id}`);
        console.log(`Initial Trust Score: ${freelancer.trustScore}, Badges: ${freelancer.badges.join(', ')}`);

        // 2. Create a mock enterprise admin
        console.log('2. Creating mock enterprise admin...');
        const adminResponse = await axios.post(`${USER_SERVICE_URL}/api/users`, {
            email: `admin_${Date.now()}@example.com`,
            firstName: 'Bob',
            lastName: 'Enterprise',
            roles: ['CLIENT']
        });
        const admin = adminResponse.data;
        console.log(`Admin created: ${admin.id}`);

        // 3. Create a Talent Cloud
        console.log('3. Creating Talent Cloud...');
        const cloudResponse = await axios.post(`${TALENT_CLOUD_SERVICE_URL}/api/clouds`, {
            name: 'Vetted React Experts',
            description: 'Private pool of top React developers',
            ownerId: admin.id,
            visibility: 'PRIVATE'
        });
        const cloud = cloudResponse.data;
        console.log(`Cloud created: ${cloud.id} (${cloud.name})`);

        // 4. Add freelancer to the Talent Cloud
        console.log(`4. Adding freelancer ${freelancer.id} to cloud ${cloud.id}...`);
        await axios.post(`${TALENT_CLOUD_SERVICE_URL}/api/clouds/${cloud.id}/members`, {
            userId: freelancer.id,
            role: 'MEMBER'
        });
        console.log('Freelancer added to cloud.');

        // 5. Verify user reputation update in user-service
        console.log('5. Verifying reputation update in user-service...');
        // Give it a small delay for async processing if any (though here it's direct HTTP and awaited)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const updatedFreelancerResponse = await axios.get(`${USER_SERVICE_URL}/api/users/${freelancer.id}`);
        const updatedFreelancer = updatedFreelancerResponse.data;

        console.log(`Updated Trust Score: ${updatedFreelancer.trustScore}`);
        console.log(`Updated Badges: ${updatedFreelancer.badges.join(', ')}`);

        const finalScore = updatedFreelancer.trustScore;
        const hasBadge = updatedFreelancer.badges.includes('CLOUD_MEMBER');
        const scoreBoosted = finalScore > 10; // Initial was 10 (email verified)

        if (hasBadge && scoreBoosted && finalScore === 30) {
            console.log(`✅ VERIFICATION PASSED: CLOUD_MEMBER badge added and reputation boosted to ${finalScore}!`);
        } else {
            console.error(`❌ VERIFICATION FAILED: Badge or trust score not updated correctly (Score: ${finalScore}, Badges: ${updatedFreelancer.badges.join(', ')})`);
            if (!hasBadge) console.error('- Missing CLOUD_MEMBER badge');
            if (!scoreBoosted) console.error('- Trust score not boosted');
            process.exit(1);
        }

        // 6. Test removal
        console.log('6. Testing member removal...');
        await axios.delete(`${TALENT_CLOUD_SERVICE_URL}/api/clouds/${cloud.id}/members/${freelancer.id}`);
        console.log('Freelancer removed from cloud.');

        await new Promise(resolve => setTimeout(resolve, 1000));
        const finalFreelancerResponse = await axios.get(`${USER_SERVICE_URL}/api/users/${freelancer.id}`);
        const finalFreelancer = finalFreelancerResponse.data;

        console.log(`Final Trust Score: ${finalFreelancer.trustScore}`);
        console.log(`Final Badges: ${finalFreelancer.badges.join(', ')}`);

        if (!finalFreelancer.badges.includes('CLOUD_MEMBER')) {
            console.log('✅ VERIFICATION PASSED: CLOUD_MEMBER badge removed correctly.');
        } else {
            console.error('❌ VERIFICATION FAILED: CLOUD_MEMBER badge still present after removal.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ VERIFICATION FAILED with error:');
        if (error.response) {
            console.error(error.response.status, error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

verifyTalentClouds();
