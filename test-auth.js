// Test script for authentication system
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';
const TEST_USER = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'password123',
};

async function testAuth() {
  console.log('🧪 Testing Authentication System');
  console.log('--------------------------------');

  try {
    // Step 1: Register a new user
    console.log('1️⃣ Registering new user...');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });

    const registerResult = await registerResponse.json();
    console.log('Registration result:', registerResult.success ? '✅ Success' : '❌ Failed');
    if (!registerResult.success) {
      console.error('Registration error:', registerResult.error);
      return;
    }

    // Step 2: Login with the new user
    console.log('\n2️⃣ Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
        redirect: false,
        json: true,
      }),
    });

    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult.ok ? '✅ Success' : '❌ Failed');
    if (!loginResult.ok) {
      console.error('Login error:', loginResult.error);
      return;
    }

    console.log('\n🎉 Authentication test completed successfully!');
    console.log('You can now log in with:');
    console.log(`Email: ${TEST_USER.email}`);
    console.log(`Password: ${TEST_USER.password}`);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testAuth(); 