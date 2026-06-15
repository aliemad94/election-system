import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    dashboard_storm: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '15s',
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
const ENDPOINTS = [
  '/api/indicators', '/api/stats', '/api/tribes', '/api/voters?page=1',
];

export default function () {
  const ep = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  const res = http.get(`${BASE}${ep}`);
  check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 300 });
}
