// API route to get user's chat history
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { chatHistoryService } from '@/lib/chatHistoryService'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const history = await chatHistoryService.getUserHistory(userId)
    return NextResponse.json({ history })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { original, enhanced, improvements } = await request.json()

    if (!original || !enhanced || !improvements) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newItem = await chatHistoryService.addHistoryItem(userId, {
      original,
      enhanced,
      improvements
    })

    return NextResponse.json({ item: newItem })
  } catch (error) {
    console.error('Error adding chat history:', error)
    return NextResponse.json(
      { error: 'Failed to add chat history' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await chatHistoryService.clearUserHistory(userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing chat history:', error)
    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    )
  }
}
