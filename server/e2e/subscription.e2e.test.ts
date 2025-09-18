import { test, expect } from '@playwright/test';

test.describe.serial('Subscription E2E Tests', () => {
  
  // Generate unique email for this test run to avoid conflicts
  const timestamp = Date.now();
  const testUser = {
    email: `e2e-subscription-${timestamp}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Subscription',
    lastName: 'Test'
  };

  let authToken = '';
  let userId = '';

  test.beforeAll(async () => {
    console.log('🔧 Subscription Test Setup - Starting subscription test suite');
    console.log('🔧 Test Setup - Using unique test email:', testUser.email);
  });

  test('User registration for subscription testing', async ({ request }) => {
    console.log('🔄 Starting subscription user registration');
    const response = await request.post('/api/auth/register', {
      data: testUser
    });
    
    expect(response.status()).toBe(201);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody.data).toHaveProperty('user');
    expect(responseBody.data).toHaveProperty('tokens');
    expect(responseBody.data.user).toHaveProperty('subscriptionPlan', 'free'); // New users should be on free plan
    
    // Store for subsequent tests
    authToken = responseBody.data.tokens.accessToken;
    userId = responseBody.data.user.id;
    
    console.log('✅ Subscription user registration successful - Default plan:', responseBody.data.user.subscriptionPlan);
  });

  test('Get subscription plans (public endpoint)', async ({ request }) => {
    console.log('🔄 Testing subscription plans endpoint');
    const response = await request.get('/api/subscription/plans');
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody.data).toHaveProperty('plans');
    expect(Array.isArray(responseBody.data.plans)).toBe(true);
    expect(responseBody.data.plans.length).toBe(4); // free, basic, pro, enterprise
    
    // Verify plan structure
    const plans = responseBody.data.plans;
    const planIds = plans.map((plan: any) => plan.id);
    expect(planIds).toEqual(['free', 'basic', 'pro', 'enterprise']);
    
    // Verify free plan details
    const freePlan = plans.find((plan: any) => plan.id === 'free');
    expect(freePlan).toBeDefined();
    expect(freePlan.price).toBe(0);
    expect(freePlan.limits.dailyCompressions).toBe(5);
    expect(freePlan.limits.monthlyCompressions).toBe(10);
    expect(freePlan.limits.maxFileSize).toBe(5 * 1024 * 1024); // 5MB
    
    console.log('✅ Subscription plans retrieved successfully');
  });

  test('Get current user subscription (free plan)', async ({ request }) => {
    console.log('🔄 Testing current subscription endpoint for free user');
    const response = await request.get('/api/subscription/current', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody.data).toHaveProperty('plan', 'free');
    expect(responseBody.data).toHaveProperty('status', 'none'); // No active subscription for free plan
    expect(responseBody.data).toHaveProperty('limits');
    expect(responseBody.data.limits.dailyCompressions).toBe(5);
    expect(responseBody.data.limits.monthlyCompressions).toBe(10);
    expect(responseBody.data.limits.maxFileSize).toBe(5 * 1024 * 1024); // 5MB
    
    console.log('✅ Current subscription retrieved successfully for free plan');
  });

  test('Get usage statistics for free user', async ({ request }) => {
    console.log('🔄 Testing usage statistics endpoint');
    const response = await request.get('/api/subscription/usage', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody.data).toHaveProperty('current');
    expect(responseBody.data.current).toHaveProperty('plan', 'free');
    expect(responseBody.data.current).toHaveProperty('usage');
    
    // Verify usage structure
    const usage = responseBody.data.current.usage;
    expect(usage).toHaveProperty('daily');
    expect(usage).toHaveProperty('monthly');
    expect(usage.daily).toHaveProperty('used');
    expect(usage.daily).toHaveProperty('limit', 5); // Free plan daily limit
    expect(usage.daily).toHaveProperty('remaining');
    expect(usage.monthly).toHaveProperty('used');
    expect(usage.monthly).toHaveProperty('limit', 10); // Free plan monthly limit
    expect(usage.monthly).toHaveProperty('remaining');
    
    console.log('✅ Usage statistics retrieved successfully');
  });

  test('Get billing history for free user (empty)', async ({ request }) => {
    console.log('🔄 Testing billing history endpoint for free user');
    const response = await request.get('/api/subscription/billing-history', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody.data).toHaveProperty('invoices');
    expect(responseBody.data).toHaveProperty('hasMore', false);
    expect(Array.isArray(responseBody.data.invoices)).toBe(true);
    expect(responseBody.data.invoices.length).toBe(0); // Free users should have no invoices
    
    console.log('✅ Billing history retrieved successfully (empty for free user)');
  });

  test('Test feature access - batch processing (should fail for free plan)', async ({ request }) => {
    console.log('🔄 Testing batch processing feature access for free user');
    const response = await request.get('/api/subscription/features/batch-processing', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(403); // Should be forbidden for free plan
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody.message).toContain('batch_processing');
    expect(responseBody.message).toContain('not available');
    expect(responseBody).toHaveProperty('userPlan', 'free');
    
    console.log('✅ Batch processing correctly blocked for free plan');
  });

  test('Test feature access - API access (should fail for free plan)', async ({ request }) => {
    console.log('🔄 Testing API access feature for free user');
    const response = await request.get('/api/subscription/features/api-access', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(403); // Should be forbidden for free plan
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody.message).toContain('api_access');
    expect(responseBody.message).toContain('not available');
    expect(responseBody).toHaveProperty('userPlan', 'free');
    
    console.log('✅ API access correctly blocked for free plan');
  });

  test('Test usage tracking endpoint', async ({ request }) => {
    console.log('🔄 Testing usage tracking endpoint');
    const response = await request.post('/api/subscription/track-usage/compression', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Usage tracked successfully');
    expect(responseBody).toHaveProperty('data');
    expect(responseBody.data).toHaveProperty('plan', 'free');
    expect(responseBody.data).toHaveProperty('current');
    expect(responseBody.data).toHaveProperty('limit');
    expect(responseBody.data).toHaveProperty('remaining');
    
    console.log('✅ Usage tracking successful');
  });

  test('Test subscription plan update attempt (should fail without Stripe subscription)', async ({ request }) => {
    console.log('🔄 Testing subscription plan update for free user');
    const response = await request.post('/api/subscription/update-plan', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        newPlan: 'basic',
        interval: 'month'
      }
    });
    
    expect(response.status()).toBe(404); // Should fail - no active subscription to update
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody.message).toContain('Active subscription not found');
    
    console.log('✅ Plan update correctly blocked for user without active subscription');
  });

  test('Test subscription cancellation attempt (should fail - no subscription to cancel)', async ({ request }) => {
    console.log('🔄 Testing subscription cancellation for free user');
    const response = await request.post('/api/subscription/cancel', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        immediately: false
      }
    });
    
    expect(response.status()).toBe(404); // Should fail - no subscription to cancel
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody.message).toContain('Active subscription not found');
    
    console.log('✅ Cancellation correctly blocked for user without active subscription');
  });

  test('Test subscription reactivation attempt (should fail - no subscription to reactivate)', async ({ request }) => {
    console.log('🔄 Testing subscription reactivation for free user');
    const response = await request.post('/api/subscription/reactivate', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(404); // Should fail - no subscription to reactivate
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody.message).toContain('Subscription not found');
    
    console.log('✅ Reactivation correctly blocked for user without subscription');
  });

  test('Test subscription middleware - require subscription (should pass for free plan basic access)', async ({ request }) => {
    console.log('🔄 Testing subscription middleware enforcement');
    
    // Test an endpoint that should work for free users (current subscription)
    const response = await request.get('/api/subscription/current', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody.data.plan).toBe('free');
    
    console.log('✅ Subscription middleware correctly allows free plan access to basic endpoints');
  });

});