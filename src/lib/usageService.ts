import { supabase } from './supabase'

export interface UsageRecord {
  id: string
  user_id: string
  month_year: string // Format: 'YYYY-MM'
  usage_count: number
  created_at: string
  updated_at: string
}

export interface PlanLimits {
  free: number
  starter: number
  pro: number
  business: number
}

export const PLAN_LIMITS: PlanLimits = {
  free: 25,
  starter: 500,
  pro: 2000,
  business: 10000
}

export class UsageService {
  private static getCurrentMonthYear(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  static async getCurrentUsage(userId: string): Promise<number> {
    const monthYear = this.getCurrentMonthYear()
    try {
      const { data, error } = await supabase
        .from('user_usage')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('month_year', monthYear)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching usage:', error)
        return 0 // fallback silently (route will still enforce limits via default path)
      }
      return data?.usage_count || 0
    } catch (e) {
      console.error('Supabase usage lookup failed (fallback to 0):', e)
      return 0
    }
  }

  static async incrementUsage(userId: string): Promise<number> {
    const monthYear = this.getCurrentMonthYear()
    try {
      // Try to update existing record
      const { data: existingData, error: fetchError } = await supabase
        .from('user_usage')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('month_year', monthYear)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching usage for increment:', fetchError)
        return 1 // treat as first usage
      }

      if (existingData) {
        const newCount = existingData.usage_count + 1
        const { error: updateError } = await supabase
          .from('user_usage')
          .update({ 
            usage_count: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('month_year', monthYear)

        if (updateError) {
          console.error('Error updating usage:', updateError)
          return existingData.usage_count // fallback keep old count
        }
        return newCount
      } else {
        const { data, error: insertError } = await supabase
          .from('user_usage')
          .insert({
            user_id: userId,
            month_year: monthYear,
            usage_count: 1
          })
          .select('usage_count')
          .single()

        if (insertError) {
          console.error('Error creating usage record:', insertError)
          return 1
        }
        return data.usage_count
      }
    } catch (e) {
      console.error('Supabase increment usage failed (fallback to 1):', e)
      return 1
    }
  }

  static getPlanLimit(planName: string): number {
    const normalizedPlan = planName.toLowerCase()
    
    if (normalizedPlan.includes('starter')) return PLAN_LIMITS.starter
    if (normalizedPlan.includes('pro')) return PLAN_LIMITS.pro  
    if (normalizedPlan.includes('business')) return PLAN_LIMITS.business
    
    return PLAN_LIMITS.free // Default to free plan
  }

  static async checkUsageLimit(userId: string, planName: string): Promise<{
    canUse: boolean
    currentUsage: number
    limit: number
    remaining: number
  }> {
    const currentUsage = await this.getCurrentUsage(userId)
    const limit = this.getPlanLimit(planName)
    const remaining = Math.max(0, limit - currentUsage)
    
    return {
      canUse: currentUsage < limit,
      currentUsage,
      limit,
      remaining
    }
  }
}
