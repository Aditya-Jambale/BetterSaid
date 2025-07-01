// API route to delete individual chat history item
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { chatHistoryService } from '@/lib/chatHistoryService'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const historyId = resolvedParams.id
    
    if (!historyId) {
      return NextResponse.json(
        { error: 'History ID is required' },
        { status: 400 }
      )
    }

    await chatHistoryService.deleteHistoryItem(userId, historyId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat history item:', error)
    return NextResponse.json(
      { error: 'Failed to delete chat history item' },
      { status: 500 }
    )
  }
}
