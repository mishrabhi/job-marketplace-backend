import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },   // Ramp-up to 50 concurrent users
    { duration: '30s', target: 200 },  // Spike to 200 concurrent users
    { duration: '20s', target: 500 },  // Stress spike to 500 concurrent users
    { duration: '10s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100', 'p(99)<250'], // 95% of requests must complete below 100ms
    http_req_failed: ['rate<0.01'],               // Error rate < 1%
  },
};

export default function () {
  const url = 'http://localhost:3000/api/v1/throughput/fast-batch-feed';
  const res = http.get(url);

  check(res, {
    'status is 200 or 503 (graceful degradation)': (r) => r.status === 200 || r.status === 503,
    'latency is under SLA': (r) => r.timings.duration < 150,
  });

  sleep(0.05); // Rapid cycling
}