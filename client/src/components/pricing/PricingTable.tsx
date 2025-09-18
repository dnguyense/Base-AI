import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Check, Zap, Crown, Building } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limits: {
    dailyCompressions: number;
    monthlyCompressions: number;
    maxFileSize: number;
  };
  popular?: boolean;
  icon: React.ReactNode;
}

interface PricingTableProps {
  onSelectPlan: (plan: string, interval: 'month' | 'year') => void;
  loading?: boolean;
  currentPlan?: string;
}

const PricingTable: React.FC<PricingTableProps> = ({
  onSelectPlan,
  loading = false,
  currentPlan
}) => {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await authFetch('/api/v1/subscription/plans', {}, false);
        const data = await response.json();

        if (data.success) {
          // Add icons and format the plans
          const formattedPlans = [
            {
              ...data.data.plans.find((p: any) => p.id === 'free'),
              icon: <Zap className="h-6 w-6" />,
            },
            {
              ...data.data.plans.find((p: any) => p.id === 'basic'),
              icon: <Check className="h-6 w-6" />,
            },
            {
              ...data.data.plans.find((p: any) => p.id === 'pro'),
              icon: <Crown className="h-6 w-6" />,
            },
            {
              ...data.data.plans.find((p: any) => p.id === 'enterprise'),
              icon: <Building className="h-6 w-6" />,
            },
          ].filter(Boolean);
          
          setPlans(formattedPlans);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        setError('Unable to load pricing plans. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatPrice = (price: number, interval: 'month' | 'year') => {
    if (price === 0) return 'Free';
    
    const monthlyPrice = interval === 'year' ? price / 12 : price;
    return `$${(monthlyPrice / 100).toFixed(2)}`;
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB >= 1000) {
      return `${sizeInMB / 1000}GB`;
    }
    return `${sizeInMB}MB`;
  };

  const getYearlySavings = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 10; // 2 months free
    const savings = (monthlyPrice * 12) - yearlyPrice;
    return Math.round(savings / 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-lg">
          <Button
            variant={billingInterval === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingInterval('month')}
            className="rounded-md"
          >
            Monthly
          </Button>
          <Button
            variant={billingInterval === 'year' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingInterval('year')}
            className="rounded-md ml-1"
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-xs">
              Save 20%
            </Badge>
          </Button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isPro = plan.id === 'pro';
          const isFree = plan.id === 'free';
          const price = billingInterval === 'year' && !isFree ? plan.price * 10 : plan.price;
          
          return (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-200 hover:shadow-lg",
                isPro && "ring-2 ring-primary ring-offset-2",
                isCurrentPlan && "bg-muted"
              )}
            >
              {isPro && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <CardHeader className={cn("text-center", isPro && "pt-12")}>
                <div className="flex items-center justify-center mb-4">
                  <div className={cn(
                    "p-3 rounded-full",
                    isFree && "bg-gray-100 text-gray-600",
                    plan.id === 'basic' && "bg-blue-100 text-blue-600",
                    plan.id === 'pro' && "bg-purple-100 text-purple-600",
                    plan.id === 'enterprise' && "bg-gray-100 text-gray-800"
                  )}>
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold">
                      {formatPrice(price, billingInterval)}
                    </span>
                    {!isFree && (
                      <span className="text-muted-foreground ml-1">
                        /{billingInterval === 'year' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  
                  {billingInterval === 'year' && !isFree && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Save ${getYearlySavings(plan.price)} per year
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limits */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Daily limit:</span>
                      <span className="font-medium text-foreground">
                        {plan.limits.dailyCompressions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly limit:</span>
                      <span className="font-medium text-foreground">
                        {plan.limits.monthlyCompressions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max file size:</span>
                      <span className="font-medium text-foreground">
                        {formatFileSize(plan.limits.maxFileSize)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isFree ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onSelectPlan(plan.id, billingInterval)}
                      disabled={loading || isCurrentPlan}
                      className={cn(
                        "w-full",
                        isPro && "bg-primary hover:bg-primary/90",
                        isCurrentPlan && "opacity-50"
                      )}
                      variant={isPro ? "default" : "outline"}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          <span>Processing...</span>
                        </div>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        `Choose ${plan.name}`
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>All plans include secure processing, automatic file deletion, and 24/7 support.</p>
        <p className="mt-1">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );
};

export default PricingTable;
