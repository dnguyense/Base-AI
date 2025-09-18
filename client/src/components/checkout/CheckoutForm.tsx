import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Check, Lock, CreditCard, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFormProps {
  plan: string;
  interval: 'month' | 'year';
  onSuccess?: (sessionId: string) => void;
  onCancel?: () => void;
}

interface PlanDetails {
  name: string;
  price: number;
  features: string[];
}

const PLAN_DETAILS: Record<string, PlanDetails> = {
  basic: {
    name: 'Basic',
    price: 999,
    features: [
      '20 compressions per day',
      '100 compressions per month',
      'Up to 25MB file size',
      'Priority processing',
      'Advanced compression settings'
    ]
  },
  pro: {
    name: 'Pro',
    price: 1999,
    features: [
      '100 compressions per day',
      '1,000 compressions per month',
      'Up to 100MB file size',
      'Batch processing',
      'API access',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 4999,
    features: [
      '1,000 compressions per day',
      '10,000 compressions per month',
      'Up to 500MB file size',
      'White-label solutions',
      'Custom integrations',
      'Dedicated support'
    ]
  }
};

const CheckoutFormContent: React.FC<CheckoutFormProps> = ({
  plan,
  interval,
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const { authFetch, isAuthenticated, authError } = useAuth();

  const planDetails = PLAN_DETAILS[plan];
  const price = interval === 'year' ? planDetails.price * 10 : planDetails.price;
  const monthlyPrice = interval === 'year' ? planDetails.price / 12 : planDetails.price;

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const getYearlySavings = () => {
    if (interval === 'year') {
      const yearlySavings = (planDetails.price * 12) - (planDetails.price * 10);
      return Math.round(yearlySavings / 100);
    }
    return 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create checkout session
      if (!isAuthenticated) {
        setError(authError || 'Please sign in to subscribe.');
        setIsLoading(false);
        return;
      }

      const response = await authFetch('/api/v1/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          interval,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: result.data.sessionId,
      });

      if (error) {
        throw new Error(error.message || 'Failed to redirect to checkout');
      }

      if (onSuccess) {
        onSuccess(result.data.sessionId);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '10px 12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{planDetails.name} Plan</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {formatPrice(monthlyPrice)}/{interval === 'year' ? 'mo' : 'month'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {interval === 'year' ? (
              <div className="flex items-center space-x-2">
                <span>Billed annually - {formatPrice(price)}/year</span>
                <Badge variant="default" className="text-green-700 bg-green-100">
                  Save ${getYearlySavings()}/year
                </Badge>
              </div>
            ) : (
              <span>Billed monthly - {formatPrice(price)}/month</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">What's included:</h4>
              <ul className="space-y-1">
                {planDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Billing Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{planDetails.name} Plan ({interval})</span>
                  <span>{formatPrice(price)}</span>
                </div>
                {interval === 'year' && (
                  <div className="flex justify-between text-green-600">
                    <span>Annual Savings</span>
                    <span>-${getYearlySavings()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(price)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Information</span>
          </CardTitle>
          <CardDescription>
            Your payment is secured with 256-bit SSL encryption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Element */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Card Information</label>
              <div className="border rounded-md p-3 bg-white">
                <CardElement
                  options={cardElementOptions}
                  onChange={(event) => {
                    setError(event.error ? event.error.message : null);
                    setCardComplete(event.complete);
                  }}
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-1" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Security Notice */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <Lock className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4 space-y-3 space-y-reverse sm:space-y-0">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!stripe || isLoading || !cardComplete}
                className={cn(
                  "w-full sm:w-auto min-w-[200px]",
                  "bg-primary hover:bg-primary/90"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Subscribe to {planDetails.name} - {formatPrice(monthlyPrice)}/{interval === 'year' ? 'mo' : 'month'}</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <div className="text-center text-sm text-gray-600 space-y-2">
        <p>
          By subscribing, you agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
        <p>You can cancel your subscription at any time from your account settings.</p>
      </div>
    </div>
  );
};

const CheckoutForm: React.FC<CheckoutFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent {...props} />
    </Elements>
  );
};

export default CheckoutForm;
