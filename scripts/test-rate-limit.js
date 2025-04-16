// Test script for rate limiting functionality
import { rateLimit } from '../lib/rate-limit.js';

async function testRateLimit() {
  console.log('Testing rate limiting functionality...');
  
  const limiter = rateLimit({
    interval: 5000, // 5 seconds for testing
    uniqueTokenPerInterval: 10,
  });
  
  const token = 'test-token';
  
  try {
    // First request should succeed
    await limiter.check(3, token);
    console.log('✅ First request succeeded');
    
    // Second request should succeed
    await limiter.check(3, token);
    console.log('✅ Second request succeeded');
    
    // Third request should succeed
    await limiter.check(3, token);
    console.log('✅ Third request succeeded');
    
    // Fourth request should fail (limit is 3)
    try {
      await limiter.check(3, token);
      console.error('❌ Fourth request should have failed');
    } catch (error) {
      console.log('✅ Fourth request correctly failed (rate limit exceeded)');
    }
    
    // Wait for the interval to reset
    console.log('Waiting for rate limit to reset...');
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    // This request should succeed after the interval resets
    await limiter.check(3, token);
    console.log('✅ Request after reset succeeded');
    
    console.log('✅ Rate limiting test completed successfully');
  } catch (error) {
    console.error('❌ Error testing rate limiting:', error);
  }
  
  process.exit(0);
}

testRateLimit(); 