import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 20 }, // ramp up to 20 users
        { duration: '1m', target: 20 },  // stay at 20 users
        { duration: '30s', target: 0 },  // ramp down to 0 users
    ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
    // 1. Health check
    let res = http.get(`${BASE_URL}/api/users/health`);
    check(res, { 'status is 200': (r) => r.status === 200 });

    // 2. Get jobs
    res = http.get(`${BASE_URL}/api/jobs`);
    check(res, { 'jobs status is 200': (r) => r.status === 200 });

    sleep(1);
}
