'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Crown, Star, Building } from 'lucide-react'
import Link from 'next/link'

interface UsageInfo {
  currentUsage: number
  monthlyLimit: number
  remainingUsage: number
  currentPlan: string
}

export function UsageDisplay({ planInfo }: { planInfo?: UsageInfo }) {
  const { user } = useUser()
  const [usage, setUsage] = useState<UsageInfo | null>(planInfo || null)

  useEffect(() => {
    if (planInfo) {
      setUsage(planInfo)
    }
  }, [planInfo])

  if (!user || !usage) return null

  const usagePercentage = (usage.currentUsage / usage.monthlyLimit) * 100
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = usagePercentage >= 100

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'starter': return <Zap className="h-4 w-4" />
      case 'pro': return <Star className="h-4 w-4" />
      case 'business': return <Building className="h-4 w-4" />
      default: return <Crown className="h-4 w-4" />
    }
  }

  const getCardClassName = () => {
    if (isAtLimit) return 'border-red-200 bg-red-50'
    if (isNearLimit) return 'border-yellow-200 bg-yellow-50'
    return ''
  }

  const getUsageTextColor = () => {
    if (isAtLimit) return 'text-red-600'
    if (isNearLimit) return 'text-yellow-600'
    return 'text-gray-900'
  }

  const getProgressColor = () => {
    if (isAtLimit) return '#ef4444'
    if (isNearLimit) return '#eab308'
    return '#3b82f6'
  }

  const cardClassName = getCardClassName()
  const usageTextColor = getUsageTextColor()
  const progressColor = getProgressColor()

  return (
    <Card className={cardClassName}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            {getPlanIcon(usage.currentPlan)}
            {usage.currentPlan.charAt(0).toUpperCase() + usage.currentPlan.slice(1)} Plan
          </Badge>
          
          {(isNearLimit || isAtLimit) && (
            <Link href="/pricing">
              <Button size="sm" variant={isAtLimit ? "destructive" : "outline"} className="text-xs h-7 px-2">
                {isAtLimit ? 'Upgrade' : 'Upgrade'}
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Monthly Usage</span>
            <span className={`font-medium ${usageTextColor}`}>
              {usage.currentUsage.toLocaleString()} / {usage.monthlyLimit.toLocaleString()}
            </span>
          </div>
          
          <Progress 
            value={Math.min(usagePercentage, 100)} 
            className="h-1.5"
            style={{
              '--progress-background': progressColor
            } as React.CSSProperties}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {usage.remainingUsage > 0 
                ? `${usage.remainingUsage.toLocaleString()} remaining`
                : 'Limit reached'
              }
            </span>
            
            {usage.currentPlan === 'free' && (
              <Link href="/pricing">
                <Button size="sm" variant="ghost" className="text-xs h-5 px-1.5">
                  Plans
                </Button>
              </Link>
            )}
          </div>
        </div>

        {isAtLimit && (
          <div className="mt-2 p-1.5 bg-red-100 border border-red-200 rounded-md">
            <p className="text-xs text-red-800">
              Monthly limit reached. Upgrade to continue.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
