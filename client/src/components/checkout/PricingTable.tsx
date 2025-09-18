import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Check, Star, Sparkles, Zap, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular?: boolean;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline';
  icon: React.ReactNode;
}

interface PricingTableProps {
  onSelectPlan: (planId: string, interval: 'month' | 'year') => void;
  loading?: string | null; // planId that's currently loading
  className?: string;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for personal use',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    features: [
      '20 compressions per day',
      '100 compressions per month',
      'Up to 25MB file size',
      'Priority processing',
      'Advanced compression settings',
      'Email support'
    ],
    buttonText: 'Start Basic Plan',
    buttonVariant: 'outline',
    icon: <Zap className="h-6 w-6 text-blue-600" />
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and small teams',
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    features: [
      '100 compressions per day',
      '1,000 compressions per month',
      'Up to 100MB file size',
      'Batch processing',
      'API access',
      'Priority support',
      'Advanced analytics',
      'Custom compression presets'
    ],
    popular: true,
    buttonText: 'Start Pro Plan',
    buttonVariant: 'default',
    icon: <Star className="h-6 w-6 text-purple-600" />
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large teams and organizations',
    monthlyPrice: 4999,
    yearlyPrice: 49990,
    features: [
      '1,000 compressions per day',
      '10,000 compressions per month',
      'Up to 500MB file size',
      'White-label solutions',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Team management',
      'Advanced security'
    ],
    buttonText: 'Start Enterprise Plan',
    buttonVariant: 'outline',
    icon: <Crown className="h-6 w-6 text-amber-600" />
  }
];

const PricingTable: React.FC<PricingTableProps> = ({
  onSelectPlan,
  loading,
  className
}) => {
  const [isYearly, setIsYearly] = useState(false);

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    const savings = monthlyTotal - yearlyPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percentage };
  };

  const getDisplayPrice = (plan: PricingPlan) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getPriceLabel = () => {
    return isYearly ? 'per year' : 'per month';
  };

  return (
    <div className={cn("max-w-7xl mx-auto", className)}>
      {/* Billing Toggle */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-3 p-1 bg-gray-100 rounded-full">
          <span className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            !isYearly ? "text-gray-900" : "text-gray-500"
          )}>
            Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-primary"
          />
          <span className={cn(
            "px-4 py-2 text-sm font-medium transition-colors flex items-center space-x-2",
            isYearly ? "text-gray-900" : "text-gray-500"
          )}>
            <span>Yearly</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Save up to 20%
            </Badge>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {PRICING_PLANS.map((plan) => {
          const displayPrice = getDisplayPrice(plan);
          const savings = isYearly ? calculateYearlySavings(plan.monthlyPrice, plan.yearlyPrice) : null;
          const isLoading = loading === plan.id;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-200 hover:shadow-lg",
                plan.popular 
                  ? "border-primary border-2 shadow-lg scale-105" 
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  {plan.icon}
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
                
                <div className="mt-4">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(displayPrice)}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {getPriceLabel()}
                    </span>
                  </div>
                  
                  {isYearly && savings && savings.amount > 0 && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      Save {formatPrice(savings.amount)} ({savings.percentage}% off)
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => onSelectPlan(plan.id, isYearly ? 'year' : 'month')}
                  disabled={isLoading}
                  variant={plan.buttonVariant}
                  className={cn(
                    "w-full h-12 text-base font-semibold transition-all",
                    plan.popular && plan.buttonVariant === 'default' && 
                    "bg-primary hover:bg-primary/90 text-primary-foreground"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </Button>

                {/* Additional Info */}
                <p className="text-xs text-gray-500 text-center mt-3">
                  Cancel anytime. No hidden fees.
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison - Mobile Optimized */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-center mb-6">
          All plans include these core features
        </h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            'Secure file processing',
            'GDPR compliant',
            '256-bit SSL encryption',
            'Automatic file deletion',
            'No file size watermarks',
            'Multiple compression formats',
            'Batch processing queue',
            'Mobile-responsive interface'
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="text-center mt-8 py-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">
          Trusted by over 10,000+ users worldwide
        </p>
        <div className="flex justify-center items-center space-x-6 text-xs text-gray-500">
          <span>✓ 30-day money-back guarantee</span>
          <span>✓ 99.9% uptime SLA</span>
          <span>✓ SOC 2 compliant</span>
        </div>
      </div>
    </div>
  );
};

export default PricingTable;