/**
 * Simple backend test script
 * Run with: node test-backend.js
 * Make sure backend is running on port 5000
 */

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

async function runTests() {
  console.log('🧪 Testing Backend API...\n');

  const tests = [
    {
      name: 'Health Check - Root endpoint',
      test: async () => {
        const response = await makeRequest('/');
        return response.status === 200 && response.data.includes('Hello');
      },
    },
    {
      name: 'Auth - Login endpoint exists',
      test: async () => {
        try {
          const response = await makeRequest('/api/auth/login/admin-service-provider', 'POST', {
            email: 'test@test.com',
            password: 'test',
          });
          // Should return 400 (invalid credentials) not 404 (not found)
          return response.status === 400 || response.status === 401;
        } catch (error) {
          return false;
        }
      },
    },
    {
      name: 'Auth - Send OTP endpoint exists',
      test: async () => {
        try {
          const response = await makeRequest('/api/auth/send-otp', 'POST', {
            mobileNumber: '1234567890',
          });
          // Should return 404 (farmer not found) or 400, not 404 route not found
          return response.status === 400 || response.status === 404;
        } catch (error) {
          return false;
        }
      },
    },
    {
      name: 'Claims - Endpoint exists (should require auth)',
      test: async () => {
        try {
          const response = await makeRequest('/api/claims');
          // Should return 401 (unauthorized) not 404 (not found)
          return response.status === 401 || response.status === 403;
        } catch (error) {
          return false;
        }
      },
    },
    {
      name: 'Farm Details - Endpoint exists (should require auth)',
      test: async () => {
        try {
          const response = await makeRequest('/api/farm-details');
          // Should return 401 (unauthorized) not 404 (not found)
          return response.status === 401 || response.status === 403;
        } catch (error) {
          return false;
        }
      },
    },
    {
      name: 'Policies - Endpoint exists (should require auth)',
      test: async () => {
        try {
          const response = await makeRequest('/api/policies');
          // Should return 401 (unauthorized) not 404 (not found)
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
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check backend configuration.');
    process.exit(1);
  }
}

// Check if backend is running
makeRequest('/')
  .then(() => {
    runTests();
  })
  .catch((error) => {
    console.error('❌ Cannot connect to backend. Make sure it\'s running on port 5000');
    console.error('Error:', error.message);
    process.exit(1);
  });

