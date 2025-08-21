import Link from 'next/link'
import { ArrowLeft, Zap, Shield, Users, Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px]"></div>
      </div>
      
      {/* Floating Orbs */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/3 right-20 w-32 h-32 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-xl opacity-25 animate-pulse delay-2000"></div>
      
      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 text-purple-200 hover:text-white hover:bg-white/10 transition-all duration-200">
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Button>
          </Link>
        </div>

        {/* Page Title */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 text-transparent bg-clip-text text-sm font-semibold tracking-wider uppercase">
              Pricing Plans
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-violet-300 text-transparent bg-clip-text">
              Perfect Plan
            </span>
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Unlock the full power of AI-enhanced prompts with our flexible pricing plans.
            Start free and scale as your needs grow.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-purple-200 text-sm">Get enhanced prompts in seconds with our optimized AI engine</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure & Private</h3>
            <p className="text-purple-200 text-sm">Your data is protected with enterprise-grade security</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Team Friendly</h3>
            <p className="text-purple-200 text-sm">Collaborate seamlessly with your team members</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Premium Quality</h3>
            <p className="text-purple-200 text-sm">Get the best prompt enhancements powered by advanced AI</p>
          </div>
        </div>

        {/* Beta Pricing Notice */}
        <div className="w-full max-w-none mx-auto relative">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 md:p-10">
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Pricing Coming Soon</h2>
                <div className="mx-auto max-w-2xl space-y-4 text-gray-600 text-lg">
                  <p>
                    BetterSaid is currently in <span className="font-semibold text-purple-600">open beta</span>. During this phase you can use core enhancement features <span className="font-medium">for free</span> while we refine infrastructure, quality and limits.
                  </p>
                  <p>
                    Subscription plans (Starter, Pro, Business) will launch after beta with generous free tier allowances. Your feedback now directly shapes usage tiers and premium capabilities.
                  </p>
                  <p className="text-sm text-gray-500">
                    No billing is active yet. If you want early access to premium limits or to be notified at launch, follow updates from the home page.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl px-6 h-11">
                      Return Home
                    </Button>
                  </Link>
                  <Link href="/release">
                    <Button variant="outline" className="h-11 border-2">
                      Release Notes
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-white mb-8">What&apos;s Included in All Plans</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-purple-100 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="font-medium">AI-powered prompt enhancement</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="font-medium">Chat history & organization</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="font-medium">Export & sharing options</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="font-medium">Real-time processing</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="font-medium">Mobile-optimized interface</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="font-medium">24/7 customer support</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-white/20 to-purple-200/20 backdrop-blur-sm border border-purple-300/30 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-purple-100 mb-6 text-lg">
              Join thousands of users who are already enhancing their prompts with BetterSaid
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg">
                Start Enhancing Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
