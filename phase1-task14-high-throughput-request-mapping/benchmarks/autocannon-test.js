import autocannon from 'autocannon';

const instance = autocannon({
  url: 'http://localhost:3000/api/v1/throughput/fast-batch-feed',
  connections: 100, // 100 concurrent connections
  duration: 20,     // Run for 20 seconds
  pipelining: 1
}, (err, result) => {
  if (err) console.error(err);
  console.log('Autocannon Load Test Completed:');
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Latency (p99): ${result.latency.p99}ms`);
  console.log(`2xx Responses: ${result['2xx']}`);
  console.log(`Non-2xx Responses (Shedded): ${result.non2xx}`);
});

autocannon.track(instance, { renderProgressBar: true });