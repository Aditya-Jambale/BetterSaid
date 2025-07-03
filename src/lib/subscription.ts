// lib/subscription.ts

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '25 enhancements per month',
      'Basic prompt enhancement',
      'Community support'
    ],
    limits: {
      monthlyEnhancements: 25
    }
  },
  starter: {
    name: 'Starter',
    price: 199, // $1.99 in cents
    priceId: 'starter', // This should match your Clerk plan ID
    features: [
      '500 enhancements per month',
      'Advanced prompt enhancement',
      'Email support',
      'Enhanced AI models'
    ],
    limits: {
      monthlyEnhancements: 500
    }
  },
  pro: {
    name: 'Pro',
    price: 499, // $4.99 in cents
    priceId: 'pro', // This should match your Clerk plan ID
    features: [
      '2,000 enhancements per month',
      'Premium prompt enhancement',
      'Priority support',
      'Advanced features',
      'Usage analytics'
    ],
    limits: {
      monthlyEnhancements: 2000
    }
  },
  business: {
    name: 'Business',
    price: 1999, // $19.99 in cents
    priceId: 'business', // This should match your Clerk plan ID
    features: [
      '10,000 enhancements per month',
      'Enterprise prompt enhancement',
      'Dedicated support',
      'Team management',
      'Advanced analytics',
      'API access'
    ],
    limits: {
      monthlyEnhancements: 10000
    }
  }
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlanFromAuth(has: (params: { plan: string }) => boolean): PlanType {
  if (has({ plan: 'business' })) return 'business';
  if (has({ plan: 'pro' })) return 'pro';
  if (has({ plan: 'starter' })) return 'starter';
  return 'free';
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getPlanDisplayName(planType: PlanType): string {
  return PLANS[planType].name;
}

export function getPlanLimits(planType: PlanType) {
  return PLANS[planType].limits;
}

export function getPlanFeatures(planType: PlanType) {
  return PLANS[planType].features;
}
