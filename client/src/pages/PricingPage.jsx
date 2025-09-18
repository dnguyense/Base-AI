import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PricingPage = () => {
  const { isAuthenticated, isPremium } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, weekly, lifetime

  const plans = {
    free: {
      name: 'Free',
      price: 0,
      description: 'Perfect for occasional use',
      features: [
        '3 files per day',
        'Basic compression',
        '10MB max file size',
        'Standard processing speed',
        'Email support'
      ],
      limitations: [
        'Daily file limit',
        'Smaller file size limit',
        'Basic compression only'
      ]
    },
    weekly: {
      name: 'Pro Weekly',
      price: 0.99,
      originalPrice: 1.49,
      savings: 33,
      description: 'Try Pro features risk-free',
      features: [
        'Unlimited files',
        'Advanced compression',
        '50MB max file size',
        'Priority processing',
        'Batch compression',
        'Priority support',
        'No watermarks'
      ],
      popular: false
    },
    monthly: {
      name: 'Pro Monthly',
      price: 2.99,
      originalPrice: 4.99,
      savings: 40,
      description: 'Most popular choice',
      features: [
        'Unlimited files',
        'Advanced compression',
        '50MB max file size',
        'Priority processing',
        'Batch compression',
        'Priority support',
        'No watermarks',
        'API access',
        'Advanced analytics'
      ],
      popular: true
    },
    lifetime: {
      name: 'Pro Lifetime',
      price: 9.99,
      originalPrice: 49.99,
      savings: 80,
      description: 'Best value - pay once, use forever',
      features: [
        'Everything in Pro Monthly',
        'Lifetime access',
        'No recurring payments',
        'Future feature updates',
        'Premium support',
        'Commercial license',
        'Export to multiple formats'
      ],
      popular: false
    }
  };

  const handleSelectPlan = (planType) => {
    if (planType === 'free') {
      // Redirect to signup
      return;
    }
    
    // This would typically integrate with Stripe
    console.log(`Selected plan: ${planType}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
              All plans include our core compression technology.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mt-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle('weekly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'weekly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('lifetime')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'lifetime'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lifetime
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{plans.free.name}</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">
                ${plans.free.price}
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">{plans.free.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plans.free.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <svg className="h-4 w-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan('free')}
              className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              {isAuthenticated ? 'Current Plan' : 'Get Started'}
            </button>
          </div>

          {/* Pro Plans */}
          {billingCycle !== 'lifetime' && (
            <div className={`bg-white rounded-lg shadow-lg border-2 ${
              plans[billingCycle].popular ? 'border-primary' : 'border-gray-200'
            } p-6 relative`}>
              {plans[billingCycle].popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plans[billingCycle].name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">${plans[billingCycle].price}</span>
                  <span className="text-lg font-normal text-gray-600">/{billingCycle === 'weekly' ? 'week' : 'month'}</span>
                </div>
                {plans[billingCycle].originalPrice && (
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="line-through">${plans[billingCycle].originalPrice}</span>
                    <span className="ml-2 text-green-600 font-medium">
                      Save {plans[billingCycle].savings}%
                    </span>
                  </div>
                )}
                <p className="text-gray-600 mb-6">{plans[billingCycle].description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plans[billingCycle].features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <svg className="h-4 w-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(billingCycle)}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                {isPremium ? 'Current Plan' : `Start ${billingCycle === 'weekly' ? '7-Day' : '30-Day'} Trial`}
              </button>
            </div>
          )}

          {/* Lifetime Plan */}
          {billingCycle === 'lifetime' && (
            <div className="bg-white rounded-lg shadow-lg border-2 border-purple-500 p-6 relative lg:col-span-2">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                🎉 Limited Time Offer
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plans.lifetime.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">${plans.lifetime.price}</span>
                  <span className="text-lg font-normal text-gray-600"> one-time</span>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  <span className="line-through">${plans.lifetime.originalPrice}</span>
                  <span className="ml-2 text-green-600 font-medium">
                    Save {plans.lifetime.savings}%
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{plans.lifetime.description}</p>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {plans.lifetime.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <svg className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan('lifetime')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-md font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                {isPremium ? 'Upgrade to Lifetime' : 'Get Lifetime Access'}
              </button>
            </div>
          )}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Feature Comparison</h2>
          
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Features
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Free
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pro Weekly
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pro Monthly
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pro Lifetime
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Files per day
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">3</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Unlimited</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Unlimited</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Max file size
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">10MB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">50MB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">50MB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">50MB</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Compression quality
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Basic</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Advanced</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Advanced</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Advanced</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Batch processing
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">✅</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">✅</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      API access
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">✅</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Commercial license
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated amount. 
                When downgrading, the change will take effect at your next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! Pro Weekly and Pro Monthly plans include a free trial period. 
                You can cancel anytime during the trial and won't be charged.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How secure is my data?
              </h3>
              <p className="text-gray-600">
                All files are encrypted during upload and processing. We automatically delete your files 
                after compression is complete. We never store or share your documents.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and Apple Pay. All transactions are processed 
                securely through Stripe.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of users who trust PDF Compressor Pro.
          </p>
          <Link
            to="/auth"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;