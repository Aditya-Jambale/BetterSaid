'use client'

// Utility to migrate localStorage data to Supabase
// This can be used as a one-time migration for existing users

import { supabase } from './supabase'
import { useUser } from '@clerk/nextjs'

export type LocalStorageHistoryItem = {
  id: string
  original: string
  enhanced: string
  improvements: string[]
}

export const migrationService = {
  // Check if user has localStorage data that needs migration
  hasLocalStorageData(): boolean {
    try {
      const localData = localStorage.getItem('bettersaid-history')
      return localData !== null && JSON.parse(localData).length > 0
    } catch {
      return false
    }
  },

  // Get localStorage data
  getLocalStorageData(): LocalStorageHistoryItem[] {
    try {
      const localData = localStorage.getItem('bettersaid-history')
      return localData ? JSON.parse(localData) : []
    } catch {
      return []
    }
  },

  // Migrate localStorage data to Supabase
  async migrateToSupabase(userId: string): Promise<{success: boolean, migratedCount: number, errors: unknown[]}> {
    const localData = this.getLocalStorageData()
    if (localData.length === 0) {
      return { success: true, migratedCount: 0, errors: [] }
    }

    const errors: unknown[] = []
    let migratedCount = 0

    for (const item of localData) {
      try {
        const { error } = await supabase
          .from('chat_history')
          .insert({
            user_id: userId,
            original_prompt: item.original,
            enhanced_prompt: item.enhanced,
            improvements: item.improvements
          })

        if (error) {
          errors.push({ item: item.id, error })
        } else {
          migratedCount++
        }
      } catch (err) {
        errors.push({ item: item.id, error: err })
      }
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors
    }
  },

  // Clear localStorage after successful migration
  clearLocalStorage(): void {
    try {
      localStorage.removeItem('bettersaid-history')
    } catch (err) {
      console.error('Failed to clear localStorage:', err)
    }
  }
}

// React hook for handling migration
export function useMigration() {
  const { user, isSignedIn } = useUser()

  const checkAndMigrate = async (): Promise<boolean> => {
    if (!isSignedIn || !user?.id) {
      return false
    }

    if (!migrationService.hasLocalStorageData()) {
      return false
    }

    try {
      const result = await migrationService.migrateToSupabase(user.id)
      
      if (result.success) {
        migrationService.clearLocalStorage()
        console.log(`Successfully migrated ${result.migratedCount} history items`)
        return true
      } else {
        console.error('Migration completed with errors:', result.errors)
        return false
      }
    } catch (err) {
      console.error('Migration failed:', err)
      return false
    }
  }

  return {
    hasLocalData: migrationService.hasLocalStorageData(),
    migrateData: checkAndMigrate
  }
}
