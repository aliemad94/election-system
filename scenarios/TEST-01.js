import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    baseline: {
      executor: 'constant-vus',
      vus: 20,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(50)<200', 'p(95)<500', 'p(99)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const roll = Math.random();
  let res;
  if (roll < 0.25) {
    res = http.get(`${BASE}/api/voters?page=1&limit=20`);
  } else if (roll < 0.50) {
    res = http.get(`${BASE}/api/tribes`);
  } else if (roll < 0.75) {
    res = http.get(`${BASE}/api/indicators`);
  } else {
    res = http.post(`${BASE}/api/voters/checkin`,
      JSON.stringify({ voterId: `voter_${randomIntBetween(0, 49999)}` }),
      { headers: { 'Content-Type': 'application/json' } });
  }
  check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 300 });
  sleep(randomIntBetween(1, 3) / 10);
}

