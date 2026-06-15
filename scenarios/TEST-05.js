import http from 'k6/http';
import { check } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    search_load: {
      executor: 'constant-arrival-rate',
      rate: 45,            // ~30 search + 15 write per second
      timeUnit: '1s',
      duration: '20s',
      preAllocatedVUs: 100,
      maxVUs: 150,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<600'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const TERMS = ['ناخب 1', 'ناخب 23', '100000', '999', 'ناخب 45', '200'];

export default function () {
  if (Math.random() < 0.67) {
    const q = TERMS[Math.floor(Math.random() * TERMS.length)];
    const res = http.get(`${BASE}/api/search?q=${encodeURIComponent(q)}`, { tags: { op: 'search' } });
    check(res, { 'search 2xx': (r) => r.status >= 200 && r.status < 300 });
  } else {
    const res = http.post(`${BASE}/api/voters/checkin`,
      JSON.stringify({ voterId: `voter_${randomIntBetween(0, 49999)}` }),
      { headers: { 'Content-Type': 'application/json' }, tags: { op: 'write' } });
    check(res, { 'write 2xx': (r) => r.status >= 200 && r.status < 300 });
  }
}
