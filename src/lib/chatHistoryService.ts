// Server-side database operations for chat history
import { supabase, type ChatHistory } from './supabase'

export type HistoryItem = {
  id: string
  original: string
  enhanced: string
  improvements: string[]
  created_at?: string
}

// Database operations for chat history (server-side)
export const chatHistoryService = {
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
      throw error
    }

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
