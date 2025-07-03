// components/PremiumFeature.tsx

'use client';

import { ReactNode } from 'react';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import Link from 'next/link';
import type { PlanType } from '@/lib/subscription';

interface PremiumFeatureProps {
  children: ReactNode;
  requiredPlan: PlanType;
  fallback?: ReactNode;
  featureName?: string;
}

const PLAN_HIERARCHY: Record<PlanType, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  business: 3
};

export function PremiumFeature({ 
  children, 
  requiredPlan, 
  fallback,
  featureName = 'feature'
}: PremiumFeatureProps) {
  const { currentPlan, isSignedIn } = useSubscription();

  // Check if user has access to the required plan or higher
  const hasAccess = isSignedIn && PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan];

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return (
    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
      <CardHeader className="text-center pb-3">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Lock className="h-5 w-5 text-gray-500" />
          Premium Feature
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          This {featureName} requires a <span className="font-semibold capitalize">{requiredPlan}</span> plan or higher.
        </p>
        
        <div className="space-y-2">
          <Link href="/pricing">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
            </Button>
          </Link>
          
          {!isSignedIn && (
            <p className="text-xs text-gray-500">
              Sign in to see your current plan
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
