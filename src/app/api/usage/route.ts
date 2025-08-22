import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { UsageService } from '@/lib/usageService'

export async function GET() {
  try {
    const { userId, has } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Determine plan from Clerk org/claims
    const determinePlan = (checker: typeof has) => {
      if (checker({ plan: 'business' })) return 'business'
      if (checker({ plan: 'pro' })) return 'pro'
      if (checker({ plan: 'starter' })) return 'starter'
      return 'free'
    }
    const currentPlanBase = determinePlan(has)

    // Check unlimited flag via Clerk metadata
    let isUnlimited = false
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      isUnlimited = (user.publicMetadata as Record<string, unknown> | null | undefined)?.unlimited_enhancements === true
    } catch (e) {
      // Non-fatal
      console.warn('[API /usage] Failed to fetch user metadata:', e)
    }

    if (isUnlimited) {
      return NextResponse.json({
        currentUsage: 0,
        monthlyLimit: -1,
        remainingUsage: 0,
        currentPlan: 'unlimited'
      })
    }

    // Get current usage and plan limits
    const usage = await UsageService.getCurrentUsage(userId)
    const limit = UsageService.getPlanLimit(currentPlanBase)
    const remaining = Math.max(0, limit - usage)

    return NextResponse.json({
      currentUsage: usage,
      monthlyLimit: limit,
      remainingUsage: remaining,
      currentPlan: currentPlanBase
    })
  } catch (error) {
    console.error('[API /usage] Internal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
