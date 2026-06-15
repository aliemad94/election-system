import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    mixed_peak: {
      executor: 'per-vu-iterations',
      vus: 200,
      iterations: 5,
      maxDuration: '60s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const roll = Math.random();
  let res, tags;
  if (roll < 0.35) {
    tags = { op: 'write' };
    res = http.post(`${BASE}/api/voters/checkin`,
      JSON.stringify({ voterId: `voter_${randomIntBetween(0, 49999)}` }),
      { headers: { 'Content-Type': 'application/json' }, tags });
  } else if (roll < 0.60) {
    tags = { op: 'read' };
    res = http.get(`${BASE}/api/indicators`, { tags });
  } else if (roll < 0.75) {
    tags = { op: 'read' };
    res = http.get(`${BASE}/api/search?q=${encodeURIComponent('ناخب ' + randomIntBetween(1, 5000))}`, { tags });
  } else {
    tags = { op: 'read' };
    res = http.get(`${BASE}/api/voters?page=${randomIntBetween(1, 50)}`, { tags });
  }
  check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 300 });
  sleep(randomIntBetween(15, 20) / 1000);
}
