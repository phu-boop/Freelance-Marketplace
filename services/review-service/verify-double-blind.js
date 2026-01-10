// Simulate Double-Blind logic
const reviews = [];

function createReview(dto) {
    const existing = reviews.find(r => r.reviewer_id === dto.reviewer_id && r.contract_id === dto.contract_id);
    if (existing) throw new Error('Duplicate review');

    const opposing = reviews.find(r =>
        r.reviewer_id === dto.reviewee_id &&
        r.reviewee_id === dto.reviewer_id &&
        r.contract_id === dto.contract_id &&
        r.status === 'PENDING'
    );

    const status = opposing ? 'RELEASED' : 'PENDING';
    const revealedAt = opposing ? new Date() : null;

    const review = {
        ...dto,
        id: Math.random().toString(36).substr(2, 9),
        status,
        revealedAt,
        createdAt: new Date()
    };
    reviews.push(review);

    if (opposing) {
        opposing.status = 'RELEASED';
        opposing.revealedAt = new Date();
        console.log(`RELEASED BOTH: Review ${review.id} and ${opposing.id}`);
    } else {
        console.log(`STAY PENDING: Review ${review.id}`);
    }

    return review;
}

// Test Flow
console.log('--- Step 1: Freelancer reviews Client ---');
createReview({
    reviewer_id: 'freelancer-1',
    reviewee_id: 'client-1',
    contract_id: 'contract-123',
    ratingOverall: 5
});

console.log('--- Step 2: Client reviews Freelancer ---');
createReview({
    reviewer_id: 'client-1',
    reviewee_id: 'freelancer-1',
    contract_id: 'contract-123',
    ratingOverall: 4
});

console.log('--- Results ---');
console.log(JSON.stringify(reviews, null, 2));

const allReleased = reviews.every(r => r.status === 'RELEASED');
if (allReleased && reviews.length === 2) {
    console.log('VERIFICATION PASSED: Both reviews released successfully.');
} else {
    console.log('VERIFICATION FAILED: Feedback integrity compromised.');
    process.exit(1);
}
