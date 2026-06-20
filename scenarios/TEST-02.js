import http from 'k6/http';
import { check } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    write_spike: {
      executor: 'ramping-arrival-rate',
      startRate: 30,
      timeUnit: '1s',
      preAllocatedVUs: 200,
      maxVUs: 300,
      stages: [
        { target: 30,  duration: '5s' },
        { target: 80,  duration: '5s' },
        { target: 150, duration: '10s' },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.post(`${BASE}/api/voters/checkin`,
    JSON.stringify({ voterId: `voter_${randomIntBetween(0, 49999)}` }),
    { headers: { 'Content-Type': 'application/json' }, timeout: '10s' });

  check(res, {
    'status 2xx': (r) => r.status >= 200 && r.status < 300,
    'no_db_lock': (r) => !String(r.body).includes('SQLITE_BUSY'),
  }, { type: 'no_db_lock' });
}

