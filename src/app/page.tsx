'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Clipboard, Check, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage, type HistoryItem, type ApiResponse } from '@/lib/hooks/useLocalStorage';
import { toast } from 'sonner';
import ClientOnly from '@/components/ClientOnly';

export default function Home() {
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
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">
                About
              </a>
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="hidden sm:flex border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20"></div>
        </div>
        <div className="relative container mx-auto px-4 pt-20 pb-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <Sparkles className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                <div 
                  className="absolute -inset-3 bg-purple-600/40 rounded-full blur-xl"
                  style={{ 
                    animation: 'pulse 3s ease-in-out infinite',
                    animationDelay: '0s'
                  }}
                ></div>
                <div 
                  className="absolute -inset-2 bg-purple-400/50 rounded-full blur-lg"
                  style={{ 
                    animation: 'pulse 2.5s ease-in-out infinite',
                    animationDelay: '0.5s'
                  }}
                ></div>
                <div 
                  className="absolute -inset-1 bg-purple-300/60 rounded-full blur-md"
                  style={{ 
                    animation: 'pulse 2s ease-in-out infinite',
                    animationDelay: '1s'
                  }}
                ></div>
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                BetterSaid
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Transform your prompts into powerful, detailed instructions for AI with our advanced prompt engineering technology
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
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

        {/* Features Section */}
        <div className="mt-20 max-w-4xl mx-auto" id="features">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">Why Choose BetterSaid?</h2>
            <p className="text-gray-600 dark:text-gray-400">Advanced AI-powered prompt engineering for better results</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">AI-Powered Enhancement</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Advanced algorithms analyze and improve your prompts for maximum effectiveness</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Instant Results</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Get enhanced prompts in seconds with detailed improvement explanations</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Learn & Improve</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Understand what makes prompts effective with detailed improvement insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
