/**
 * Script để tạo user test
 * Chạy: node create-test-user.js
 */

const http = require('http');

const data = JSON.stringify({
  username: 'testuser',
  password: '123456',
  fullname: 'Test User',
  email: 'test@example.com'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', responseData);
    
    if (res.statusCode === 201) {
      console.log('\n✅ User created successfully!');
      console.log('Username: testuser');
      console.log('Password: 123456');
    } else if (res.statusCode === 400) {
      const response = JSON.parse(responseData);
      if (response.message.includes('already exists')) {
        console.log('\n⚠️  User already exists. You can login with:');
        console.log('Username: testuser');
        console.log('Password: 123456');
      } else {
        console.log('\n❌ Error:', response.message);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\n⚠️  Make sure backend is running on http://localhost:3000');
});

req.write(data);
req.end();
