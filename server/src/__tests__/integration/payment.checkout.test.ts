import express from 'express';
import request from 'supertest';
import User from '../../models/User';
import { createCheckoutSession } from '../../controllers/payment';

const describeIfServerAllowed = process.env.JEST_ALLOW_SERVER === 'true' ? describe : describe.skip;

process.env.STRIPE_BASIC_MONTHLY_PRICE_ID = process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_basic_monthly_test';

const buildTestApp = (userId: number) => {
  const checkoutApp = express();
  checkoutApp.use(express.json());
  checkoutApp.post('/checkout', async (req, res) => {
    (req as any).user = { id: userId };
    await createCheckoutSession(req as any, res as any);
  });
  return checkoutApp;
};

describeIfServerAllowed('Payment Checkout Integration', () => {
  it('creates checkout session for stored customer', async () => {
    const user = await User.create({
      email: `checkout-int-${Date.now()}@example.com`,
      password: 'Checkout123!',
      firstName: 'Pay',
      lastName: 'Ment',
      stripeCustomerId: 'cus_integration',
      subscriptionStatus: 'none',
      subscriptionPlan: 'free',
      dailyCompressions: 0,
      monthlyCompressions: 0,
      totalCompressions: 0,
      lastCompressionReset: new Date(),
    });

    const app = buildTestApp(user.id);

    const stripeModule = require('stripe');
    const stripeCtor = stripeModule.default as jest.Mock;
    const stripeInstance = stripeCtor.mock.instances[0];
    stripeInstance.checkout.sessions.create.mockResolvedValueOnce({
      id: 'sess_int_123',
      url: 'https://checkout.stripe.com/pay/sess_int_123',
    });

    const response = await request(app)
      .post('/checkout')
      .send({ plan: 'basic', interval: 'month' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.sessionId).toBe('sess_int_123');

    await user.destroy();
  });
});
