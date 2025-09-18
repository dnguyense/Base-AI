import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, Download, CreditCard, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface SubscriptionDetails {
  plan: string;
  amount: number;
  currency: string;
  interval: string;
  nextBillingDate: string;
  features: string[];
}

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch, isAuthenticated, authError } = useAuth();

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!sessionId) {
        setError('Invalid session. Please try again.');
        setLoading(false);
        return;
      }

      if (!isAuthenticated) {
        setError('You must be signed in to view this page.');
        setLoading(false);
        return;
      }

      try {
        const response = await authFetch('/api/v1/subscription/current');

        const result = await response.json();

        if (result.success && result.data.subscription) {
          const sub = result.data.subscription;
          
          // Map plan to features
          const featureMap: Record<string, string[]> = {
            basic: [
              '20 compressions per day',
              '100 compressions per month',
              'Up to 25MB file size',
              'Priority processing',
              'Advanced compression settings'
            ],
            pro: [
              '100 compressions per day',
              '1,000 compressions per month',
              'Up to 100MB file size',
              'Batch processing',
              'API access',
              'Priority support'
            ],
            enterprise: [
              '1,000 compressions per day',
              '10,000 compressions per month',
              'Up to 500MB file size',
              'White-label solutions',
              'Custom integrations',
              'Dedicated support'
            ]
          };

          setSubscription({
            plan: sub.plan,
            amount: sub.amount,
            currency: sub.currency,
            interval: sub.interval,
            nextBillingDate: sub.currentPeriodEnd,
            features: featureMap[sub.plan] || []
          });
        } else {
          setError('Failed to load subscription details.');
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [authFetch, isAuthenticated, sessionId]);

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your subscription details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const message = authError && !isAuthenticated ? authError : error;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">{message}</p>
            <Button onClick={() => navigate('/pricing')}>
              Return to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to {subscription?.plan.charAt(0).toUpperCase()}{subscription?.plan.slice(1)}! 🎉
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your subscription has been activated successfully. You now have access to all premium features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Subscription Details */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span>Subscription Details</span>
                <Badge variant="default" className="bg-green-600">
                  Active
                </Badge>
              </CardTitle>
              <CardDescription>
                Your {subscription?.plan} plan is now active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold capitalize">{subscription?.plan}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600">Billing</span>
                <span className="font-semibold">
                  {subscription && `${formatPrice(subscription.amount)}/${subscription.interval === 'month' ? 'month' : 'year'}`}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600">Next Billing</span>
                <span className="font-semibold">
                  {subscription && formatDate(subscription.nextBillingDate)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-100 rounded-lg p-3">
                <Calendar className="h-4 w-4" />
                <span>You can cancel anytime from your account settings</span>
              </div>
            </CardContent>
          </Card>

          {/* Features Unlocked */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span>Features Unlocked</span>
              </CardTitle>
              <CardDescription>
                Everything included in your {subscription?.plan} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {subscription?.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
            <CardDescription>
              Get started with your new premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate('/compress')}
                className="flex items-center space-x-2 h-auto py-4"
              >
                <Download className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Start Compressing</div>
                  <div className="text-sm opacity-90">Upload your first PDF</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/account')}
                className="flex items-center space-x-2 h-auto py-4"
              >
                <CreditCard className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Manage Account</div>
                  <div className="text-sm opacity-90">View billing & settings</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/help')}
                className="flex items-center space-x-2 h-auto py-4"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium">Get Help</div>
                  <div className="text-sm opacity-90">Learn advanced features</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Thank you for subscribing!</h3>
          <p className="text-gray-600 mb-4">
            We're excited to help you compress your PDFs more efficiently. 
            If you have any questions, our support team is here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/support" className="text-primary hover:underline">
              Contact Support
            </a>
            <span className="text-gray-300">•</span>
            <a href="/help" className="text-primary hover:underline">
              Help Center
            </a>
            <span className="text-gray-300">•</span>
            <a href="/account" className="text-primary hover:underline">
              Account Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
