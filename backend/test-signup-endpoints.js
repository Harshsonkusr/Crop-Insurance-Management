/**
 * Test script for signup endpoints
 * Run with: node test-signup-endpoints.js
 * Make sure backend is running on port 5000
 */

require('dotenv').config();
const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testSignupEndpoints() {
  console.log('🧪 Testing Signup Endpoints...\n');

  const tests = [
    {
      name: 'Farmer Signup - Endpoint exists',
      test: async () => {
        try {
          const response = await makeRequest('/api/auth/signup/farmer', 'POST', {
            name: 'Test Farmer',
            mobileNumber: '9999999999',
          });
          // Should return 201 (created) or 400 (already exists) or 500 (server error), not 404
          return response.status !== 404;
        } catch (error) {
          return false;
        }
      },
    },
    {
      name: 'Farmer Signup - Validates required fields',
      test: async () => {
        try {
          const response = await makeRequest('/api/auth/signup/farmer', 'POST', {
            name: '',
          });
          // Should return 400 (bad request) for missing fields
          return response.status === 400;
        } catch (error) {
          return false;
        }
      },
    },
    {
      name: 'Admin/Service Provider Signup - Removed (should 404)',
      test: async () => {
        try {
          const response = await makeRequest('/api/auth/signup/admin-service-provider', 'POST', {
            name: 'Test Admin',
            email: 'test@test.com',
            password: 'password123',
            role: 'ADMIN',
          });
          // Should return 404 (not found) since endpoint was removed
          return response.status === 404;
        } catch (error) {
          return false;
        }
      },
    },
    {
      name: 'Admin User Creation - Requires authentication',
      test: async () => {
        try {
          const response = await makeRequest('/api/admin/users', 'POST', {
            name: 'Test User',
            email: 'test@test.com',
            password: 'password123',
            role: 'ADMIN',
          });
          // Should return 401 (unauthorized) not 404
          return response.status === 401 || response.status === 403;
        } catch (error) {
          return false;
        }
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.test();
      if (result) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All signup endpoint tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check backend configuration.');
    process.exit(1);
  }
}

// Check if backend is running
makeRequest('/')
  .then(() => {
    testSignupEndpoints();
  })
  .catch((error) => {
    console.error('❌ Cannot connect to backend. Make sure it\'s running on port 5000');
    console.error('Error:', error.message);
    process.exit(1);
  });

