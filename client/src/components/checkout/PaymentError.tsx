import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { XCircle, RefreshCw, CreditCard, ArrowLeft, Mail, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaymentErrorDetails {
  code: string;
  message: string;
  type: string;
  declineCode?: string;
  suggestion?: string;
}

interface ErrorCodeMapping {
  [key: string]: {
    title: string;
    description: string;
    canRetry: boolean;
    suggestion: string;
  };
}

const ERROR_CODE_MAPPINGS: ErrorCodeMapping = {
  // Card errors
  'card_declined': {
    title: 'Card Declined',
    description: 'Your card was declined. Please check your card details and try again.',
    canRetry: true,
    suggestion: 'Contact your bank or try a different payment method.'
  },
  'insufficient_funds': {
    title: 'Insufficient Funds',
    description: 'Your card has insufficient funds for this transaction.',
    canRetry: true,
    suggestion: 'Please add funds to your account or use a different card.'
  },
  'expired_card': {
    title: 'Card Expired',
    description: 'Your card has expired.',
    canRetry: true,
    suggestion: 'Please update your card information with a valid card.'
  },
  'incorrect_cvc': {
    title: 'Incorrect CVC',
    description: 'The card security code (CVC) you entered is incorrect.',
    canRetry: true,
    suggestion: 'Please check the 3-digit code on the back of your card.'
  },
  'processing_error': {
    title: 'Processing Error',
    description: 'We encountered an error while processing your payment.',
    canRetry: true,
    suggestion: 'Please try again in a few moments.'
  },
  'authentication_required': {
    title: 'Authentication Required',
    description: 'Your bank requires additional authentication for this payment.',
    canRetry: true,
    suggestion: 'Please complete the authentication process with your bank.'
  },
  // Network/system errors
  'generic_decline': {
    title: 'Payment Failed',
    description: 'Your payment could not be processed at this time.',
    canRetry: true,
    suggestion: 'Please try again or contact your bank for assistance.'
  },
  'rate_limit': {
    title: 'Too Many Attempts',
    description: 'Too many payment attempts have been made.',
    canRetry: false,
    suggestion: 'Please wait 15 minutes before trying again.'
  },
  'api_error': {
    title: 'System Error',
    description: 'We encountered a temporary system error.',
    canRetry: true,
    suggestion: 'Please try again in a few minutes.'
  }
};

const PaymentError: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<PaymentErrorDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Get error details from URL parameters or session storage
  useEffect(() => {
    const errorCode = searchParams.get('error_code') || 'generic_decline';
    const errorMessage = searchParams.get('error_message') || 'Payment failed';
    const errorType = searchParams.get('error_type') || 'card_error';
    const declineCode = searchParams.get('decline_code') || undefined;

    setErrorDetails({
      code: errorCode,
      message: errorMessage,
      type: errorType,
      declineCode,
    });
    setLoading(false);
  }, [searchParams]);

  const getErrorMapping = () => {
    if (!errorDetails) return ERROR_CODE_MAPPINGS.generic_decline;
    return ERROR_CODE_MAPPINGS[errorDetails.code] || ERROR_CODE_MAPPINGS.generic_decline;
  };

  const handleRetryPayment = () => {
    // Clear error parameters and return to pricing/checkout
    navigate('/pricing');
  };

  const handleContactSupport = () => {
    // Navigate to support or open support modal
    navigate('/help', { state: { issue: 'payment_error', details: errorDetails } });
  };

  const handleTryDifferentCard = () => {
    // Return to checkout with option to use different card
    navigate('/pricing', { state: { retryPayment: true } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading error details...</p>
        </div>
      </div>
    );
  }

  const errorMapping = getErrorMapping();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {errorMapping.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            {errorMapping.description}
          </p>
        </div>

        {/* Error Details Card */}
        <Card className="border-red-200 bg-red-50/50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <XCircle className="h-5 w-5" />
              <span>Payment Error Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="bg-white border-red-200">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {errorDetails?.message || 'Payment processing failed'}
              </AlertDescription>
            </Alert>

            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h4 className="font-medium mb-2 text-red-800">What can you do?</h4>
              <p className="text-sm text-gray-700 mb-3">{errorMapping.suggestion}</p>
              
              {errorDetails?.declineCode && (
                <div className="text-xs text-gray-500">
                  <strong>Decline Code:</strong> {errorDetails.declineCode}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Options */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {/* Retry Payment */}
          {errorMapping.canRetry && (
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <Button
                  onClick={handleRetryPayment}
                  className="w-full h-auto py-4 flex items-center space-x-3"
                >
                  <RefreshCw className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Try Again</div>
                    <div className="text-sm opacity-90">Retry your payment</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Try Different Payment Method */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Button
                variant="outline"
                onClick={handleTryDifferentCard}
                className="w-full h-auto py-4 flex items-center space-x-3"
              >
                <CreditCard className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Different Card</div>
                  <div className="text-sm opacity-90">Use another payment method</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Button
                variant="outline"
                onClick={handleContactSupport}
                className="w-full h-auto py-4 flex items-center space-x-3"
              >
                <Mail className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Get Help</div>
                  <div className="text-sm opacity-90">Contact our support team</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full h-auto py-4 flex items-center space-x-3"
              >
                <ArrowLeft className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Back to Home</div>
                  <div className="text-sm opacity-90">Return to homepage</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Common Issues and Solutions */}
        <Card>
          <CardHeader>
            <CardTitle>Common Payment Issues</CardTitle>
            <CardDescription>
              Here are some common reasons payments fail and how to resolve them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900">Card Information</h4>
                <p className="text-sm text-gray-600">
                  Double-check your card number, expiry date, and security code (CVC) are correct.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-gray-900">Billing Address</h4>
                <p className="text-sm text-gray-600">
                  Ensure your billing address matches what your bank has on file.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-gray-900">Bank Authorization</h4>
                <p className="text-sm text-gray-600">
                  Some banks require authorization for online transactions. Check with your bank if the payment was blocked.
                </p>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium text-gray-900">International Cards</h4>
                <p className="text-sm text-gray-600">
                  If using an international card, ensure it's enabled for online international transactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Contact Information */}
        <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Still having trouble?</h3>
          <p className="text-gray-600 mb-4">
            Our support team is here to help you resolve payment issues quickly.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:support@pdfcompressor.pro" className="text-primary hover:underline">
                support@pdfcompressor.pro
              </a>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-gray-600">1-800-PDF-HELP</span>
            </div>
            <span className="text-gray-300">•</span>
            <a href="/help" className="text-primary hover:underline">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;