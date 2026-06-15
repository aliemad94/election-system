import http from 'k6/http';
import { check } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    closing_burst: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 600,
      maxDuration: '90s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const k = __ITER % 4;
  let res;
  if (k === 0) {
    res = http.post(`${BASE}/api/voters/checkin`,
      JSON.stringify({ voterId: `voter_${randomIntBetween(0, 49999)}` }),
      { headers: { 'Content-Type': 'application/json' }, timeout: '15s' });
  } else if (k === 1) {
    res = http.get(`${BASE}/api/indicators`, { timeout: '15s' });
  } else if (k === 2) {
    res = http.get(`${BASE}/api/voters?page=1`, { timeout: '15s' });
  } else {
    res = http.get(`${BASE}/api/tribes`, { timeout: '15s' });
  }
  check(res, { 'served': (r) => r.status !== 0 }, { type: 'served' });
}
