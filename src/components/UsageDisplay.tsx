'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Star, Building, Infinity as InfinityIcon, Crown } from 'lucide-react'
import AccessCodeInput from '@/components/AccessCodeInput'
import { useRouter } from 'next/navigation'

interface UsageInfo {
  currentUsage: number
  monthlyLimit: number
  remainingUsage: number
  currentPlan: string
}

export function UsageDisplay({ planInfo }: Readonly<{ planInfo?: UsageInfo }>) {
  const { user } = useUser()
  const [usage, setUsage] = useState<UsageInfo | null>(planInfo || null)
  const [loading, setLoading] = useState<boolean>(!planInfo)
  const [refreshTick, setRefreshTick] = useState(0)
  const [showAccessCode, setShowAccessCode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (planInfo) {
      setUsage(planInfo)
      setLoading(false)
    }
  }, [planInfo])

  useEffect(() => {
    // If no planInfo passed, fetch current usage from API
    if (!planInfo && user) {
      let cancelled = false
      const load = async () => {
        try {
          setLoading(true)
          const res = await fetch('/api/usage', { method: 'GET' })
          if (!res.ok) throw new Error('Failed to load usage')
          const data: UsageInfo = await res.json()
          if (!cancelled) setUsage(data)
        } catch (e) {
          console.warn('UsageDisplay: failed to fetch usage, will fallback to metadata if unlimited', e)
        } finally {
          if (!cancelled) setLoading(false)
        }
      }
      load()
      return () => { cancelled = true }
    }
  }, [planInfo, user, refreshTick])

  if (!user) return null

  const hasUnlimitedMeta = user.publicMetadata?.unlimited_enhancements === true

  const isUnlimitedPlan = hasUnlimitedMeta || usage?.currentPlan?.toLowerCase() === 'unlimited' || (usage && usage.monthlyLimit < 0)
  const usagePercentage = !usage || isUnlimitedPlan ? 0 : (usage.currentUsage / usage.monthlyLimit) * 100
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = usagePercentage >= 100

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
  case 'free': return <Crown className="h-4 w-4" />
      case 'starter': return <Zap className="h-4 w-4" />
      case 'pro': return <Star className="h-4 w-4" />
  case 'business': return <Building className="h-4 w-4" />
  case 'unlimited': return <InfinityIcon className="h-4 w-4 text-amber-600" />
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

  // If still loading, render a minimal skeleton card so it always shows
  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-3 space-y-2 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
        </CardContent>
      </Card>
    )
  }

  // If no usage data after fetch but user has unlimited via metadata, show unlimited status card
  if (!usage && hasUnlimitedMeta) {
    return (
      <Card className="border-amber-200 bg-white">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800">
              <InfinityIcon className="h-4 w-4 text-amber-600" />
              Unlimited
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-700 font-medium">Unlimited enhancements</span>
            <Badge variant="outline" className="text-amber-700 border-amber-300">Active</Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usage) {
    return (
      <Card className="bg-white">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <Badge variant="secondary" className="text-xs">Usage</Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Usage info unavailable</span>
            <button
              type="button"
              className="text-purple-600 hover:underline"
              onClick={(e) => { e.stopPropagation(); setRefreshTick((t) => t + 1) }}
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showAccessCode) {
    return (
      <Card className="border-purple-200 bg-white">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Redeem Access Code</span>
            <button
              className="text-xs text-purple-600 hover:underline"
              onClick={() => setShowAccessCode(false)}
            >
              Back to usage
            </button>
          </div>
          <AccessCodeInput onSuccess={() => setShowAccessCode(false)} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      onClick={() => router.push('/pricing')}
      className={cardClassName + ' transition-colors hover:border-purple-300 hover:shadow-md cursor-pointer'}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            {getPlanIcon(usage.currentPlan)}
            {usage.currentPlan.charAt(0).toUpperCase() + usage.currentPlan.slice(1)} Plan
          </Badge>
          
          {!isUnlimitedPlan && (isNearLimit || isAtLimit) && (
            <Button
              size="sm"
              variant={isAtLimit ? 'destructive' : 'outline'}
              className="text-xs h-7 px-2"
              onClick={(e) => {
                e.stopPropagation()
                router.push('/pricing')
              }}
            >
              Upgrade
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
      {isUnlimitedPlan ? (
            <div className="flex items-center justify-between text-xs">
        <span className="text-amber-700 font-medium">Unlimited enhancements</span>
        <Badge variant="outline" className="text-amber-700 border-amber-300">Active</Badge>
            </div>
          ) : (
            <>
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
                  <button
                    type="button"
                    className="text-xs text-purple-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push('/pricing')
                    }}
                  >
                    View Plans
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-2 flex justify-between items-center">
          {!isUnlimitedPlan && isAtLimit && (
          <div className="mt-2 p-1.5 bg-red-100 border border-red-200 rounded-md">
            <p className="text-xs text-red-800">
              Monthly limit reached. Upgrade to continue.
            </p>
          </div>
          )}
          {!isUnlimitedPlan && !hasUnlimitedMeta && (
            <button
              className="text-xs text-purple-600 hover:underline ml-auto"
              onClick={(e) => {
                e.stopPropagation()
                setShowAccessCode(true)
              }}
            >
              Have an access code?
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
