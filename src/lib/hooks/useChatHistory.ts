'use client'

import { supabase, type ChatHistory } from '../supabase'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export type HistoryItem = {
  id: string
  original: string
  enhanced: string
  improvements: string[]
  created_at?: string
}

export type ApiResponse = {
  enhancedPrompt: string
  improvements: string[]
  planInfo?: {
    currentPlan: string
    monthlyLimit: number
    remainingUsage: number
  }
}

// Client-side database operations for chat history
const clientChatHistoryService = {
  // Get all chat history for a user
  async getUserHistory(userId: string): Promise<HistoryItem[]> {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching chat history:', error)
      throw error
    }

    return data.map((item: ChatHistory) => ({
      id: item.id,
      original: item.original_prompt,
      enhanced: item.enhanced_prompt,
      improvements: item.improvements,
      created_at: item.created_at
    }))
  },

  // Add new chat history item
  async addHistoryItem(userId: string, item: Omit<HistoryItem, 'id' | 'created_at'>): Promise<HistoryItem> {
    console.log('Adding history item for user:', userId);
    console.log('Item data:', item);
    
    const { data, error } = await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        original_prompt: item.original,
        enhanced_prompt: item.enhanced,
        improvements: item.improvements
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding chat history:', error)
      console.error('Full error details:', JSON.stringify(error, null, 2))
      throw error
    }

    console.log('Successfully added history item:', data);
    return {
      id: data.id,
      original: data.original_prompt,
      enhanced: data.enhanced_prompt,
      improvements: data.improvements,
      created_at: data.created_at
    }
  },

  // Delete a chat history item
  async deleteHistoryItem(userId: string, itemId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting chat history:', error)
      throw error
    }
  },

  // Clear all chat history for a user
  async clearUserHistory(userId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error clearing chat history:', error)
      throw error
    }
  }
}

// Custom hook for managing chat history with Supabase
export function useChatHistory() {
  const { user, isSignedIn } = useUser()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load history when user is available
  useEffect(() => {
    if (isSignedIn && user?.id) {
      loadHistory()
    } else {
      setHistory([])
      setIsLoading(false)
    }
  }, [isSignedIn, user?.id]) // Removed loadHistory from dependencies to avoid infinite loop

  const loadHistory = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)
      const historyData = await clientChatHistoryService.getUserHistory(user.id)
      setHistory(historyData)
    } catch (err) {
      console.error('Failed to load chat history:', err)
      setError('Failed to load chat history')
      // Fallback to empty array on error
      setHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  const addHistoryItem = async (item: Omit<HistoryItem, 'id' | 'created_at'>) => {
    if (!user?.id) {
      console.error('No user ID available for saving history');
      return;
    }

    console.log('useChatHistory: Adding history item for user:', user.id);
    console.log('useChatHistory: Item:', item);

    try {
      const newItem = await clientChatHistoryService.addHistoryItem(user.id, item)
      console.log('useChatHistory: Successfully added item, updating state');
      setHistory(prev => [newItem, ...prev.slice(0, 19)]) // Keep last 20 items
      return newItem
    } catch (err) {
      console.error('useChatHistory: Failed to add chat history:', err)
      setError('Failed to save chat history')
      throw err
    }
  }

  const deleteHistoryItem = async (itemId: string) => {
    if (!user?.id) return

    try {
      await clientChatHistoryService.deleteHistoryItem(user.id, itemId)
      setHistory(prev => prev.filter(item => item.id !== itemId))
    } catch (err) {
      console.error('Failed to delete chat history:', err)
      setError('Failed to delete chat history item')
      throw err
    }
  }

  const clearHistory = async () => {
    if (!user?.id) return

    try {
      await clientChatHistoryService.clearUserHistory(user.id)
      setHistory([])
    } catch (err) {
      console.error('Failed to clear chat history:', err)
      setError('Failed to clear chat history')
      throw err
    }
  }

  return {
    history,
    isLoading,
    error,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory,
    refreshHistory: loadHistory
  }
}
