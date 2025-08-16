'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Star, Building, Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SignInButton, SignUpButton } from '@clerk/nextjs'

interface UpgradePromptProps {
  currentPlan: string
  reason: 'limit_reached' | 'unauthorized'
  onClose?: () => void
}

export function UpgradePrompt({ currentPlan, reason, onClose }: UpgradePromptProps) {
  const isUnauthorized = reason === 'unauthorized'
  const isLimitReached = reason === 'limit_reached'

  const getPlanRecommendation = (current: string) => {
    const currentLower = current.toLowerCase()
    
    if (currentLower === 'free') {
      return {
        recommended: 'starter',
        icon: <Zap className="h-5 w-5" />,
        name: 'Starter',
        price: '$1.99/month',
        limit: '500 enhancements'
      }
    }
    
    if (currentLower === 'starter') {
      return {
        recommended: 'pro',
        icon: <Star className="h-5 w-5" />,
        name: 'Pro',
        price: '$4.99/month',
        limit: '2,000 enhancements'
      }
    }
    
    if (currentLower === 'pro') {
      return {
        recommended: 'business',
        icon: <Building className="h-5 w-5" />,
        name: 'Business',
        price: '$19.99/month',
        limit: '10,000 enhancements'
      }
    }
    
    // Default fallback for any other plan
    return {
      recommended: 'ultimate',
      icon: <Crown className="h-5 w-5" />,
      name: 'Ultimate',
      price: 'Contact us',
      limit: 'Unlimited enhancements'
    }
  }

  const recommendation = getPlanRecommendation(currentPlan)

  if (isUnauthorized) {
    return (
      <Card className="border-blue-200 bg-blue-50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Crown className="h-5 w-5" />
            Sign In Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-700 text-sm">
            Please sign in to start enhancing your prompts. It&apos;s completely free to get started!
          </p>
          <div className="flex gap-2">
            <SignInButton mode="modal">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline" className="flex-1">
                Sign Up Free
              </Button>
            </SignUpButton>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLimitReached) {
    return (
      <Card className="border-amber-200 bg-amber-50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Zap className="h-5 w-5" />
            Monthly Limit Reached
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-amber-700 text-sm">
            You&apos;ve reached your monthly enhancement limit for the {currentPlan} plan. 
            Upgrade to continue enhancing prompts this month.
          </p>
          
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white">
                  {recommendation.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{recommendation.name} Plan</h4>
                  <p className="text-sm text-gray-600">{recommendation.limit}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{recommendation.price}</p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Link href="/pricing">
                Upgrade to {recommendation.name}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/pricing">
                View All Plans
              </Link>
            </Button>
          </div>

          {onClose && (
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full text-xs text-gray-500"
            >
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return null
}
