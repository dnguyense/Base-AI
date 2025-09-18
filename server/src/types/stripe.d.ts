// Custom Stripe type extensions to fix API response compatibility
declare module 'stripe' {
  namespace Stripe {
    interface Invoice {
      subscription?: string | Stripe.Subscription;
    }
    
    interface Subscription {
      current_period_start: number;
      current_period_end: number;
    }
  }
}