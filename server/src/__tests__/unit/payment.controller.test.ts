import { Request, Response } from 'express';
import * as expressValidator from 'express-validator';
import User from '../../models/User';

const { env: envConfig } = require('../../config/env');
const loadPaymentController = () => {
  let controller: any;
  jest.isolateModules(() => {
    controller = require('../../controllers/payment');
  });
  return controller;
};

const stripeCtor = require('stripe').default as jest.Mock;
let stripeMocks: { sessionsCreate: jest.Mock };

const configureStripeMock = () => {
  const sessionsCreate = jest.fn();
  const customersCreate = jest.fn().mockResolvedValue({ id: 'cus_generated' });
  stripeCtor.mockReturnValue({
    checkout: {
      sessions: {
        create: sessionsCreate,
      },
    },
    customers: {
      create: customersCreate,
    },
  });
  stripeMocks = { sessionsCreate };
};

jest.mock('express-validator', () => {
  const actual = jest.requireActual('express-validator');
  return {
    ...actual,
    validationResult: jest.fn(),
  };
});

process.env.STRIPE_BASIC_MONTHLY_PRICE_ID = process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_basic_monthly_test';
process.env.STRIPE_BASIC_YEARLY_PRICE_ID = process.env.STRIPE_BASIC_YEARLY_PRICE_ID || 'price_basic_yearly_test';

jest.mock('../../models/User');

const validationResultMock = expressValidator.validationResult as jest.MockedFunction<typeof expressValidator.validationResult>;

const mockResponse = () => {
  const res = {} as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const originalPriceIds = { ...envConfig.stripe.priceIds };

describe('Payment Controller - createCheckoutSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stripeCtor.mockReset();
    envConfig.stripe.priceIds.basicMonthly = 'price_basic_monthly_test';
    envConfig.stripe.priceIds.basicYearly = 'price_basic_yearly_test';
    envConfig.stripe.priceIds.proMonthly = envConfig.stripe.priceIds.proMonthly || 'price_pro_monthly_test';
    envConfig.stripe.priceIds.proYearly = envConfig.stripe.priceIds.proYearly || 'price_pro_yearly_test';
    envConfig.stripe.priceIds.enterpriseMonthly = undefined;
    envConfig.stripe.priceIds.enterpriseYearly = undefined;
    configureStripeMock();
  });

  afterEach(() => {
    Object.assign(envConfig.stripe.priceIds, originalPriceIds);
  });

  it('returns 400 when validation fails', async () => {
    const req = {
      body: {},
      user: { id: 1 },
    } as unknown as Request;
    const res = mockResponse();

    validationResultMock.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ msg: 'Missing plan' }],
    } as any);

    const { createCheckoutSession } = loadPaymentController();
    stripeMocks.sessionsCreate.mockResolvedValueOnce({
      id: 'sess_123',
      url: 'https://checkout.stripe.com/pay/sess_123',
    });

    await createCheckoutSession(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 404 when user cannot be loaded', async () => {
    const req = {
      body: { plan: 'basic', interval: 'month' },
      user: { id: 10 },
    } as unknown as Request;
    const res = mockResponse();

    validationResultMock.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    } as any);
    (User.findByPk as jest.Mock).mockResolvedValueOnce(null);

    const { createCheckoutSession } = loadPaymentController();
    await createCheckoutSession(req, res);

    expect(User.findByPk).toHaveBeenCalledWith(10);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when price id missing', async () => {
    envConfig.stripe.priceIds.enterpriseMonthly = undefined;
    const req = {
      body: { plan: 'enterprise', interval: 'month' },
      user: { id: 20 },
    } as unknown as Request;
    const res = mockResponse();

    validationResultMock.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    } as any);
    (User.findByPk as jest.Mock).mockResolvedValueOnce({ id: 20, stripeCustomerId: 'cus_123' });

    const { createCheckoutSession } = loadPaymentController();
    await createCheckoutSession(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('creates a checkout session for existing Stripe customer', async () => {
    const req = {
      body: { plan: 'basic', interval: 'month' },
      user: { id: 30 },
    } as unknown as Request;
    const res = mockResponse();

    validationResultMock.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    } as any);

    (User.findByPk as jest.Mock).mockResolvedValueOnce({
      id: 30,
      email: 'checkout@example.com',
      firstName: 'Checkout',
      lastName: 'User',
      stripeCustomerId: 'cus_456',
    });

    const { createCheckoutSession } = loadPaymentController();
    stripeMocks.sessionsCreate.mockResolvedValueOnce({
      id: 'sess_123',
      url: 'https://checkout.stripe.com/pay/sess_123',
    });
    await createCheckoutSession(req, res);

    expect(stripeMocks.sessionsCreate).toHaveBeenCalledWith(expect.objectContaining({
      customer: 'cus_456',
      mode: 'subscription',
      line_items: [
        expect.objectContaining({ price: 'price_basic_monthly_test' }),
      ],
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ sessionId: 'sess_123' }),
    }));
  });
});
