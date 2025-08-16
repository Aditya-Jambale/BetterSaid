'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import type { PlanType } from '@/lib/subscription'

export interface UseSubscriptionReturn {
  currentPlan: PlanType
  isSignedIn: boolean
  isLoading: boolean
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, isSignedIn } = useUser()
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isSignedIn) {
      setCurrentPlan('free')
      setIsLoading(false)
      return
    }

    // For now, we'll default to free plan
    // In a real implementation, you would:
    // 1. Check Clerk user metadata for subscription info
    // 2. Or make an API call to get current subscription
    // 3. Or check with your payment provider (Stripe, etc.)
    
    // Example of checking user metadata (if you store plan info there):
    // const planFromMetadata = user?.publicMetadata?.plan as PlanType
    // setCurrentPlan(planFromMetadata || 'free')
    
    setCurrentPlan('free') // Default to free for now
    setIsLoading(false)
  }, [isSignedIn, user])

  return {
    currentPlan,
    isSignedIn: !!isSignedIn,
    isLoading
  }
}
