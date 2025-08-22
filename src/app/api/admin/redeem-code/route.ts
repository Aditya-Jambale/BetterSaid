import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

type AccessCodeInfo = {
	type: 'unlimited'
	description: string
	expiresAt?: string | null
}

// Static access codes; case-insensitive match (we uppercase before lookup)
const ACCESS_CODES: Record<string, AccessCodeInfo> = {
	EARLYNERD: {
		type: 'unlimited',
		description: 'Early Unlimited Access',
		expiresAt: null,
	},
}

export async function POST(req: Request) {
	try {
		const { userId } = await auth()
		if (!userId) {
			return NextResponse.json({ error: 'Please sign in to redeem access code' }, { status: 401 })
		}

		const body = await req.json().catch(() => null) as { accessCode?: string } | null
		const accessCodeRaw = body?.accessCode?.trim()
		if (!accessCodeRaw) {
			return NextResponse.json({ error: 'Access code is required' }, { status: 400 })
		}

		const codeKey = accessCodeRaw.toUpperCase()
		const code = ACCESS_CODES[codeKey]
		if (!code) {
			return NextResponse.json({ error: 'Invalid access code' }, { status: 404 })
		}

		const client = await clerkClient()
		const user = await client.users.getUser(userId)

		if (user.publicMetadata?.unlimited_enhancements === true) {
			return NextResponse.json({ error: 'You already have unlimited access', alreadyUnlimited: true }, { status: 400 })
		}

		// Apply unlimited flag to public metadata (so UI can reflect it)
		await client.users.updateUserMetadata(userId, {
			publicMetadata: {
				...user.publicMetadata,
				unlimited_enhancements: true,
				access_granted_by: codeKey,
				access_granted_at: new Date().toISOString(),
				access_description: code.description,
			},
		})

		return NextResponse.json({ success: true, message: `Successfully redeemed: ${code.description}`, accessType: code.type })
	} catch (err) {
		console.error('Redeem code error:', err)
		return NextResponse.json({ error: 'Failed to redeem access code. Please try again.' }, { status: 500 })
	}
}

