import { test, expect } from '@playwright/test';

test.describe.serial('Authentication E2E Tests', () => {
  
  // Generate unique email for this test run to avoid conflicts
  const timestamp = Date.now();
  const testUser = {
    email: `e2e-test-${timestamp}@example.com`,
    password: 'TestPassword123!',
    firstName: 'E2E',
    lastName: 'Test'
  };

  let authToken = '';
  let userId = '';

  test.beforeAll(async () => {
    // Clean up any existing test user (we'll ignore errors if user doesn't exist)
    console.log('🔧 Test Setup - Starting E2E test suite');
    console.log('🔧 Test Setup - Using unique test email:', testUser.email);
  });

  test('User registration should work end-to-end', async ({ request }) => {
    console.log('🔄 Starting registration test');
    console.log('🔧 Test data:', testUser);
    const response = await request.post('/api/auth/register', {
      data: testUser
    });
    
    expect(response.status()).toBe(201);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message');
    expect(responseBody.data).toHaveProperty('user');
    expect(responseBody.data).toHaveProperty('tokens');
    expect(responseBody.data.user).toHaveProperty('id');
    expect(responseBody.data.user).toHaveProperty('email', testUser.email);
    expect(responseBody.data.user).toHaveProperty('firstName', testUser.firstName);
    expect(responseBody.data.user).toHaveProperty('lastName', testUser.lastName);
    expect(responseBody.data.user).not.toHaveProperty('password');
    
    // Store for subsequent tests
    authToken = responseBody.data.tokens.accessToken;
    userId = responseBody.data.user.id;
    
    console.log('✅ Registration successful - Token stored:', authToken ? 'Yes' : 'No');
    console.log('🔧 Token length:', authToken ? authToken.length : 0);
    console.log('🔧 User ID:', userId);
  });

  test('User login should work with valid credentials', async ({ request }) => {
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };

    const response = await request.post('/api/auth/login', {
      data: loginData
    });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Login successful');
    expect(responseBody.data).toHaveProperty('user');
    expect(responseBody.data).toHaveProperty('tokens');
    expect(responseBody.data.tokens).toHaveProperty('accessToken');
    expect(responseBody.data.tokens).toHaveProperty('refreshToken');
    
    // Update token for subsequent tests
    authToken = responseBody.data.tokens.accessToken;
  });

  test('User login should fail with invalid credentials', async ({ request }) => {
    const loginData = {
      email: testUser.email,
      password: 'wrongpassword'
    };

    const response = await request.post('/api/auth/login', {
      data: loginData
    });
    
    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('message', 'Invalid email or password');
  });

  test('Get profile should work with valid token', async ({ request }) => {
    console.log('🔄 Starting get profile test');
    console.log('🔧 Using token:', authToken ? 'Token available' : 'No token');
    console.log('🔧 Token length:', authToken ? authToken.length : 0);
    console.log('🔧 Authorization header will be:', `Bearer ${authToken}`);
    
    const response = await request.get('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody.data).toHaveProperty('user');
    expect(responseBody.data.user).toHaveProperty('email', testUser.email);
    expect(responseBody.data.user).toHaveProperty('firstName', testUser.firstName);
    expect(responseBody.data.user).toHaveProperty('lastName', testUser.lastName);
    expect(responseBody.data.user).not.toHaveProperty('password');
  });

  test('Get profile should fail without token', async ({ request }) => {
    const response = await request.get('/api/auth/profile');
    
    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody.message).toContain('token');
  });

  test('Update profile should work with valid token', async ({ request }) => {
    console.log('🔄 Starting update profile test');
    console.log('🔧 Using token:', authToken ? 'Token available' : 'No token');
    
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name'
    };

    const response = await request.put('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: updateData
    });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Profile updated successfully');
    expect(responseBody.data.user).toHaveProperty('firstName', 'Updated');
    expect(responseBody.data.user).toHaveProperty('lastName', 'Name');
  });

  test('Password reset request should work with valid email', async ({ request }) => {
    const response = await request.post('/api/auth/forgot-password', {
      data: { email: testUser.email }
    });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody.message).toContain('reset');
  });

  test('User logout should work with valid token', async ({ request }) => {
    console.log('🔄 Starting logout test');
    console.log('🔧 Using token:', authToken ? 'Token available' : 'No token');
    
    const response = await request.post('/api/auth/logout', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Logout successful');
  });

});