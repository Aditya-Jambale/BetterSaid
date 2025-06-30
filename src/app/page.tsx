'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Clipboard, Check, Lightbulb, ArrowRight, Star, Users, Zap, Shield, Clock, TrendingUp, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage, type HistoryItem, type ApiResponse } from '@/lib/hooks/useLocalStorage';
import { toast } from 'sonner';
import ClientOnly from '@/components/ClientOnly';
import { 
  SignInButton, 
  SignUpButton, 
  UserButton, 
  SignedIn, 
  SignedOut,
  useUser 
} from '@clerk/nextjs';

export default function Home() {
  // Get user info from Clerk
  const { user, isSignedIn } = useUser();
  
  // State variables
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [improvements, setImprovements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('bettersaid-history', []);

  // Typewriter effect for real-time enhancement
  const typewriterEffect = async (originalText: string, enhancedText: string) => {
    setIsEnhancing(true);
    setDisplayedText(originalText);
    
    // Wait a moment before starting the enhancement effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const words = enhancedText.split(' ');
    const originalWords = originalText.split(' ');
    
    // Start with original text and gradually replace with enhanced version
    for (let i = 0; i <= words.length; i++) {
      const currentText = words.slice(0, i).join(' ');
      setDisplayedText(currentText);
      
      // Variable delay based on word length for natural feeling
      const delay = Math.min(50 + Math.random() * 30, 100);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setIsEnhancing(false);
  };

  // Core function to enhance the prompt
  const handleEnhance = async () => {
    if (!inputPrompt.trim()) {
      setError('Please enter a prompt to enhance');
      return;
    }

    setIsLoading(true);
    setIsEnhancing(false);
    setError(null);
    setHasCopied(false);
    setDisplayedText(inputPrompt); // Start with original text

    try {
      console.log('Sending request to enhance API with prompt:', inputPrompt.substring(0, 100) + '...');
      
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputPrompt }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        throw new Error(responseData.error ?? `Server error: ${response.status}`);
      }

      const data: ApiResponse = responseData;
      
      setEnhancedPrompt(data.enhancedPrompt);
      setImprovements(data.improvements);
      setIsLoading(false);

      // Start the typewriter effect
      await typewriterEffect(inputPrompt, data.enhancedPrompt);

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        original: inputPrompt,
        enhanced: data.enhancedPrompt,
        improvements: data.improvements,
      };

      setHistory(prev => [newHistoryItem, ...prev.slice(0, 19)]); // Keep last 20 items
      
      toast.success('Prompt enhanced successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Failed to enhance prompt');
      console.error('Enhancement error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard function
  const handleCopyToClipboard = async () => {
    const textToCopy = displayedText || enhancedPrompt;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
      toast.success('Copied to clipboard!');
      
      // Reset copy status after 2 seconds
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  // Handle history item click
  const handleHistoryClick = (item: HistoryItem) => {
    setInputPrompt(item.original);
    setEnhancedPrompt(item.enhanced);
    setDisplayedText(item.enhanced);
    setImprovements(item.improvements);
    setError(null);
    setHasCopied(false);
    setIsEnhancing(false);
  };

  // Render improvements content (extracted to fix linting)
  const renderImprovementsContent = () => {
    if (isLoading || isEnhancing) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
            {isEnhancing ? 'Analyzing improvements...' : 'Processing...'}
          </p>
        </div>
      );
    }
    
    if (improvements.length > 0) {
      return (
        <div className="space-y-3 overflow-y-auto flex-1 pr-2">
          {improvements.map((improvement, index) => (
            <div key={`improvement-${improvement.slice(0, 20)}-${index}`} className="flex items-start gap-3 p-3 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-amber-200/50 dark:border-amber-700/50 hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                {index + 1}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{improvement}</p>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center flex-1 space-y-4">
        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
          <Lightbulb className="h-6 w-6 text-amber-500" />
        </div>
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
          Improvements will appear here after enhancement
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-purple-200/50 dark:border-purple-800/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl blur opacity-20 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  BetterSaid
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">AI Prompt Enhancement</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">
                How it Works
              </a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">
                Pricing
              </a>
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">
                About
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <SignedIn>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
                  </span>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                        userButtonPopoverCard: "shadow-lg",
                        userButtonPopoverActions: "text-gray-700"
                      }
                    }}
                  />
                </div>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium"
                  >
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Sign Up Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </SignUpButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Canvas Background */}
        <div className="absolute inset-0">
          <canvas 
            ref={(canvas) => {
              if (canvas && typeof window !== 'undefined') {
                // Canvas animation setup
                const ctx = canvas.getContext('2d');
                let animationId;
                
                // Animation parameters
                const circleCount = 60; // Reduced for better performance with heavy blur
                const circles = [];
                let baseHue = 220;
                
                // Initialize canvas
                const resizeCanvas = () => {
                  canvas.width = window.innerWidth;
                  canvas.height = window.innerHeight;
                };
                
                // Circle class
                class Circle {
                  constructor() {
                    this.reset();
                  }
                  
                  reset() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.radius = 80 + Math.random() * 200; // Larger circles for better blur effect
                    this.speed = 0.1 + Math.random() * 0.4; // Slower movement for aesthetic
                    this.angle = Math.random() * Math.PI * 2;
                    this.vx = this.speed * Math.cos(this.angle);
                    this.vy = this.speed * Math.sin(this.angle);
                    this.life = 0;
                    this.maxLife = 300 + Math.random() * 400; // Longer life
                    this.hue = baseHue + (Math.random() - 0.5) * 80; // Wider hue range
                  }
                  
                  update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.life++;
                    
                    // Add subtle noise-based movement
                    this.x += Math.sin(this.life * 0.01) * 0.5;
                    this.y += Math.cos(this.life * 0.01) * 0.5;
                    
                    // Reset if out of bounds or life exceeded
                    if (this.x < -this.radius || this.x > canvas.width + this.radius ||
                        this.y < -this.radius || this.y > canvas.height + this.radius ||
                        this.life > this.maxLife) {
                      this.reset();
                    }
                  }
                  
                  draw() {
                    const alpha = this.life < this.maxLife * 0.1 
                      ? this.life / (this.maxLife * 0.1)
                      : this.life > this.maxLife * 0.9 
                        ? 1 - (this.life - this.maxLife * 0.9) / (this.maxLife * 0.1)
                        : 1;
                    
                    ctx.save();
                    ctx.globalAlpha = alpha * 0.4; // Slightly higher opacity for better blur visibility
                    ctx.fillStyle = `hsl(${this.hue + Math.sin(this.life * 0.02) * 20}, 70%, 60%)`; // Dynamic color shifting
                    ctx.filter = 'blur(40px)'; // Ultra-strong blur for maximum dreamy aesthetic effect
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                  }
                }
                
                // Initialize circles
                const initCircles = () => {
                  circles.length = 0;
                  for (let i = 0; i < circleCount; i++) {
                    circles.push(new Circle());
                  }
                };
                
                // Animation loop
                const animate = () => {
                  // Clear canvas with dark background and slight trail effect
                  ctx.fillStyle = 'rgba(5, 5, 15, 0.05)'; // Lighter clear for trail effect
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  
                  // Update hue slowly for gradual color transitions
                  baseHue += 0.1;
                  
                  // Update and draw circles
                  circles.forEach(circle => {
                    circle.update();
                    circle.draw();
                  });
                  
                  // Apply additional blur to the entire canvas for ultra-dreamy aesthetic
                  ctx.save();
                  ctx.filter = 'blur(15px)';
                  ctx.globalAlpha = 0.8;
                  ctx.drawImage(canvas, 0, 0);
                  ctx.restore();
                  
                  animationId = requestAnimationFrame(animate);
                };
                
                // Setup
                resizeCanvas();
                initCircles();
                animate();
                
                // Handle resize
                const handleResize = () => {
                  resizeCanvas();
                  initCircles();
                };
                
                window.addEventListener('resize', handleResize);
                
                // Cleanup
                return () => {
                  if (animationId) {
                    cancelAnimationFrame(animationId);
                  }
                  window.removeEventListener('resize', handleResize);
                };
              }
            }}
            className="absolute inset-0 w-full h-full"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.9) 0%, rgba(40, 20, 60, 0.8) 50%, rgba(20, 40, 80, 0.9) 100%)'
            }}
          />
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/10 to-blue-900/20"></div>
        </div>
        
        <div className="relative container mx-auto px-4 pt-20 pb-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <Sparkles className="h-10 w-10 text-white drop-shadow-lg" />
                <div 
                  className="absolute -inset-3 bg-purple-400/60 rounded-full blur-xl"
                  style={{ 
                    animation: 'pulse 3s ease-in-out infinite',
                    animationDelay: '0s'
                  }}
                ></div>
                <div 
                  className="absolute -inset-2 bg-purple-300/70 rounded-full blur-lg"
                  style={{ 
                    animation: 'pulse 2.5s ease-in-out infinite',
                    animationDelay: '0.5s'
                  }}
                ></div>
                <div 
                  className="absolute -inset-1 bg-purple-200/80 rounded-full blur-md"
                  style={{ 
                    animation: 'pulse 2s ease-in-out infinite',
                    animationDelay: '1s'
                  }}
                ></div>
              </div>
              <h1 className="text-6xl font-bold text-white drop-shadow-lg">
                BetterSaid
              </h1>
            </div>
            <p className="text-xl text-white max-w-2xl mx-auto leading-relaxed mb-8 font-medium drop-shadow-md">
              Turn simple ideas into AI masterpieces. Get 10x better results with prompts that actually work - no more trial and error!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <SignedIn>
                <Button 
                  onClick={() => {
                    const demoElement = document.querySelector('#demo') as HTMLElement;
                    if (demoElement) window.scrollTo({top: demoElement.offsetTop, behavior: 'smooth'});
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Go to App
                </Button>
              </SignedIn>
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Try BetterSaid Free
                  </Button>
                </SignUpButton>
              </SignedOut>
              <Button 
                variant="outline"
                onClick={() => {
                  const targetElement = isSignedIn 
                    ? document.querySelector('#demo') as HTMLElement
                    : document.querySelector('#features') as HTMLElement;
                  if (targetElement) window.scrollTo({top: targetElement.offsetTop, behavior: 'smooth'});
                }}
                className="border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 font-medium text-lg px-8 py-4 h-auto"
              >
                <Play className="mr-2 h-5 w-5" />
                {isSignedIn ? 'Try Demo' : 'Learn More'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional content based on authentication */}
      <SignedIn>
        {/* Demo Section - Only for authenticated users */}
        <div id="demo" className="container mx-auto px-4 pb-16">
          <div className="flex gap-8 max-w-7xl mx-auto">
            {/* History Sidebar */}
            <div className="w-80 space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-[600px] flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Recent History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 overflow-y-auto flex-1 pr-2">
                  <ClientOnly fallback={
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                      <span className="ml-2 text-sm text-gray-500">Loading history...</span>
                    </div>
                  }>
                    {history.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Sparkles className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No history yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Enhanced prompts will appear here</p>
                      </div>
                    ) : (
                      history.map((item) => (
                        <button
                          key={item.id}
                          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left group"
                          onClick={() => handleHistoryClick(item)}
                        >
                          <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                            {item.original}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {item.enhanced}
                          </p>
                          {item.improvements && item.improvements.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <Lightbulb className="h-3 w-3 text-amber-500" />
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                {item.improvements.length} improvements
                              </span>
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </ClientOnly>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Input Section - Always visible when no enhanced prompt */}
              {!enhancedPrompt && !isEnhancing && (
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden mb-8">
                  <CardHeader className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-purple-100 dark:border-purple-800">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      Your Prompt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="relative">
                      <Textarea
                        placeholder="Enter your prompt here... (e.g., 'Write a blog post about AI')"
                        value={inputPrompt}
                        onChange={(e) => setInputPrompt(e.target.value)}
                        rows={8}
                        className="resize-none border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 bg-gray-50/50 dark:bg-gray-900/50 text-base leading-relaxed"
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {inputPrompt.length} characters
                      </div>
                    </div>
                    <Button 
                      onClick={handleEnhance}
                      disabled={isLoading || !inputPrompt.trim()}
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Preparing Enhancement...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Enhance Prompt
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Results Section - Only show when there's content */}
              {(isLoading || isEnhancing || enhancedPrompt || improvements.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Prompt Area - Takes 2/3 */}
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden h-[600px] flex flex-col">
                    <CardHeader className={`border-b transition-all duration-500 flex-shrink-0 ${
                      isEnhancing 
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-200 dark:border-emerald-700' 
                        : enhancedPrompt 
                          ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-100 dark:border-emerald-800'
                          : 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-100 dark:border-purple-800'
                    }`}>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${
                          isEnhancing
                            ? 'bg-emerald-200 dark:bg-emerald-800 animate-pulse'
                            : enhancedPrompt
                              ? 'bg-emerald-100 dark:bg-emerald-900'
                              : 'bg-purple-100 dark:bg-purple-900'
                        }`}>
                          {isEnhancing ? (
                            <Loader2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                          ) : enhancedPrompt ? (
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <span className="transition-all duration-500">
                          {isEnhancing 
                            ? 'AI is enhancing your prompt...' 
                            : enhancedPrompt 
                              ? 'Enhanced Prompt' 
                              : 'Your Prompt'
                          }
                        </span>
                        {isEnhancing && (
                          <div className="ml-auto flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
                              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
                              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
                            </div>
                            <span className="font-medium">Enhancing</span>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col min-h-0">
                      <div className="relative flex-1 min-h-0 mb-6">
                        <Textarea
                          placeholder="Enter your prompt here... (e.g., 'Write a blog post about AI')"
                          value={isEnhancing ? displayedText : (enhancedPrompt || inputPrompt)}
                          onChange={(e) => {
                            if (!isEnhancing && !enhancedPrompt) {
                              setInputPrompt(e.target.value);
                            }
                          }}
                          readOnly={isEnhancing || !!enhancedPrompt}
                          className={`resize-none transition-all duration-300 text-base leading-relaxed w-full h-full overflow-y-auto ${
                            isEnhancing 
                              ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20 cursor-default'
                              : enhancedPrompt
                                ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-900/10 cursor-default'
                                : 'border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 bg-gray-50/50 dark:bg-gray-900/50'
                          }`}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none bg-white/80 dark:bg-gray-800/80 rounded px-1">
                          {(isEnhancing ? displayedText : (enhancedPrompt || inputPrompt)).length} characters
                        </div>
                        {isEnhancing && (
                          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-emerald-100/90 dark:bg-emerald-900/90 backdrop-blur-sm rounded-full border border-emerald-200 dark:border-emerald-700 shadow-sm pointer-events-none">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Live Enhancement in Progress</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-3 flex-shrink-0">
                        {!enhancedPrompt && !isEnhancing && (
                          <Button 
                            onClick={handleEnhance}
                            disabled={isLoading || !inputPrompt.trim()}
                            className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Preparing Enhancement...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Enhance Prompt
                              </>
                            )}
                          </Button>
                        )}
                        
                        {(enhancedPrompt || isEnhancing) && (
                          <>
                            <Button
                              onClick={handleCopyToClipboard}
                              disabled={!enhancedPrompt || isEnhancing}
                              variant="outline"
                              className="flex-1 h-12 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 dark:text-emerald-400 font-medium text-base transition-all duration-200 disabled:opacity-50"
                            >
                              {hasCopied ? (
                                <>
                                  <Check className="mr-2 h-5 w-5 text-emerald-600" />
                                  Copied to Clipboard!
                                </>
                              ) : (
                                <>
                                  <Clipboard className="mr-2 h-5 w-5" />
                                  Copy Enhanced Prompt
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                setInputPrompt('');
                                setEnhancedPrompt('');
                                setDisplayedText('');
                                setImprovements([]);
                                setError(null);
                                setHasCopied(false);
                                setIsEnhancing(false);
                              }}
                              variant="outline"
                              className="h-12 px-6 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 dark:text-gray-400 font-medium transition-all duration-200"
                            >
                              <Sparkles className="mr-2 h-4 w-4" />
                              New Prompt
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                  {/* Key Improvements - Takes 1/3 with fixed height */}
                  <div className="lg:col-span-1">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 backdrop-blur-sm overflow-hidden h-[600px] flex flex-col">
                      <CardHeader className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-200 dark:border-amber-700 flex-shrink-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                            <Lightbulb className="h-4 w-4 text-white" />
                          </div>
                          <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
                            Key Improvements
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex-1 flex flex-col min-h-0">
                        {renderImprovementsContent()}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800 mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Enhancement Failed</h3>
                        <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">{error}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        {/* Landing Page Sections - For non-authenticated users */}
        <div>
          {/* Features Section */}
          <div className="py-20 bg-white/50 dark:bg-gray-900/50" id="features">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Why Choose BetterSaid?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Advanced AI-powered prompt engineering for better results with every interaction
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">AI-Powered Enhancement</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Advanced algorithms analyze and improve your prompts using the latest prompt engineering techniques for maximum effectiveness.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Instant Results</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Get enhanced prompts in seconds with detailed improvement explanations and real-time enhancement visualization.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Lightbulb className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Learn & Improve</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Understand what makes prompts effective with detailed improvement insights and become a prompt engineering expert.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Privacy First</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Your prompts are processed securely and never stored permanently. Complete privacy protection for sensitive content.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Save Time</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Stop spending hours crafting the perfect prompt. Let AI do the heavy lifting and focus on what matters most.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Better Results</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Get significantly better outputs from any AI model with professionally enhanced prompts that work consistently.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-20" id="how-it-works">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                How BetterSaid Works
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Transform your prompts in three simple steps
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-transparent"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Input Your Prompt</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Simply paste or type your original prompt into our intuitive interface. No special formatting required.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-emerald-300 to-transparent"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">AI Enhancement</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Our advanced AI analyzes your prompt and applies proven enhancement techniques in real-time.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Get Better Results</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Receive your enhanced prompt with detailed explanations of improvements and copy it instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-20 bg-white/50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Join thousands of satisfied users who've transformed their AI interactions
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    "BetterSaid completely transformed how I work with AI. My prompts are now 10x more effective, and I'm getting exactly the results I need every time."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      S
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">Sarah Chen</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Content Strategist</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    "As a developer, I use AI daily. BetterSaid helps me craft better code generation prompts and saves me hours of trial and error."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      M
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">Marcus Rodriguez</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Senior Developer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    "The real-time enhancement feature is incredible. I can see exactly how my prompts are improved and learn from each iteration."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      E
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">Emily Watson</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Marketing Director</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-20" id="pricing">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Choose the plan that works best for you. No hidden fees, cancel anytime.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Starter</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-800 dark:text-gray-200">$0</span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Perfect for trying out BetterSaid</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">10 enhancements per month</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">Basic improvement insights</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">Email support</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full h-12 border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-purple-700 font-medium">
                    Get Started Free
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Professional</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-800 dark:text-gray-200">$19</span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">For professionals and teams</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">500 enhancements per month</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">Advanced improvement analytics</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">Priority support</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">Export & save prompts</span>
                    </li>
                  </ul>
                  <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium">
                    Start Pro Trial
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Enterprise</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-800 dark:text-gray-200">$99</span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">For large teams and organizations</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">Unlimited enhancements</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">Custom AI models</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">24/7 dedicated support</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">API access</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full h-12 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Prompts?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who've already improved their AI interactions with BetterSaid.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignUpButton mode="modal">
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-50 font-medium text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Today
                </Button>
              </SignUpButton>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => {
                  const pricingElement = document.querySelector('#pricing') as HTMLElement;
                  if (pricingElement) window.scrollTo({top: pricingElement.offsetTop, behavior: 'smooth'});
                }}
                className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-purple-600 font-medium text-lg px-8 py-4 h-auto shadow-lg transition-all duration-200 backdrop-blur-sm"
              >
                View Pricing
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    BetterSaid
                  </h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Transform your prompts into powerful, detailed instructions for AI with our advanced prompt engineering technology.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} BetterSaid. All rights reserved.</p>
              <p className="mt-2 text-sm">
                Crafted with ❤️ by{' '}
                <a 
                  href="https://x.com/adityajtwts" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors underline decoration-dotted underline-offset-2 hover:decoration-solid"
                >
                  Aditya
                </a>
              </p>
            </div>
          </div>
        </footer>
        </div> {/* End of Landing Page Sections div */}
      </SignedOut>
    </div>
  );
}
