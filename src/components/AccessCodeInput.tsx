"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Key, CheckCircle, AlertCircle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

export default function AccessCodeInput({ onSuccess }: Readonly<{ onSuccess?: () => void }>) {
	const { user } = useUser()
	const [accessCode, setAccessCode] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [result, setResult] = useState<null | { type: 'success' | 'error'; message: string }>(null)

	const hasUnlimited = user?.publicMetadata?.unlimited_enhancements === true
	const accessDescription = (user?.publicMetadata?.access_description as string) || 'Unlimited Enhancements'

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!accessCode.trim()) {
			setResult({ type: 'error', message: 'Please enter an access code' })
			return
		}
		setIsLoading(true)
		setResult(null)
		try {
			const res = await fetch('/api/admin/redeem-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ accessCode: accessCode.trim().toUpperCase() }),
			})
			const data = await res.json()
			if (res.ok) {
				setResult({ type: 'success', message: data.message || 'Access granted' })
				setAccessCode('')
						if (onSuccess) {
							onSuccess()
						}
						setTimeout(() => window.location.reload(), 1200)
			} else {
				setResult({ type: 'error', message: data.error || 'Failed to redeem code' })
			}
			} catch (err) {
				console.error('Redeem access code request failed:', err)
				setResult({ type: 'error', message: 'Network error. Please try again.' })
		} finally {
			setIsLoading(false)
		}
	}

	if (hasUnlimited) {
		return (
			<Card className="border-green-200 bg-green-50 dark:bg-green-950/40 dark:border-green-800">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
						<CheckCircle className="w-5 h-5" /> Unlimited Access Active
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Badge variant="outline" className="border-green-300 text-green-700 dark:text-green-300">
						{accessDescription}
					</Badge>
					<p className="text-sm text-green-700/80 dark:text-green-300/80 mt-2">
						You have unlimited enhancements. Enjoy!
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2">
					<Key className="w-5 h-5" /> Access Code
				</CardTitle>
				<p className="text-sm text-muted-foreground">Have a code? Redeem it to unlock unlimited enhancements.</p>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSubmit} className="space-y-3">
					<div className="flex gap-2">
						<Input
							value={accessCode}
							onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
							placeholder="Enter access code"
							className="font-mono tracking-widest"
							autoCapitalize="characters"
						/>
						<Button type="submit" disabled={!accessCode.trim() || isLoading} className="shrink-0">
							{isLoading ? 'Redeeming…' : 'Redeem'}
						</Button>
					</div>
					{result && (
						<div
							className={`flex items-start gap-2 p-3 rounded-md text-sm border ${
								result.type === 'success'
									? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800'
									: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
							}`}
						>
							{result.type === 'success' ? (
								<CheckCircle className="w-4 h-4 mt-0.5" />
							) : (
								<AlertCircle className="w-4 h-4 mt-0.5" />
							)}
							<span>{result.message}</span>
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	)
}

