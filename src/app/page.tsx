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
  const [improvements, setImprovements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('bettersaid-history', []);

  // Core function to enhance the prompt
  const handleEnhance = async () => {
    if (!inputPrompt.trim()) {
      setError('Please enter a prompt to enhance');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasCopied(false);

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
    if (!enhancedPrompt) return;

    try {
      await navigator.clipboard.writeText(enhancedPrompt);
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
    setImprovements(item.improvements);
    setError(null);
    setHasCopied(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-primary" />
            BetterSaid
          </h1>
          <p className="text-muted-foreground">
            Transform your prompts into powerful, detailed instructions for AI
          </p>
        </div>

        <div className="flex gap-6">
          {/* History Sidebar */}
          <div className="w-80 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                <ClientOnly fallback={<p className="text-sm text-muted-foreground">Loading history...</p>}>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No history yet</p>
                  ) : (
                    history.map((item) => (
                      <button
                        key={item.id}
                        className="w-full p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors text-left"
                        onClick={() => handleHistoryClick(item)}
                      >
                        <p className="text-sm font-medium truncate">
                          {item.original}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {item.enhanced}
                        </p>
                        {item.improvements && item.improvements.length > 0 && (
                          <p className="text-xs text-primary mt-1">
                            {item.improvements.length} improvements
                          </p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Original Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your prompt here..."
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <Button 
                    onClick={handleEnhance}
                    disabled={isLoading || !inputPrompt.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Enhance Prompt
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Enhanced Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={enhancedPrompt}
                    readOnly
                    rows={8}
                    className="resize-none"
                    placeholder="Your enhanced prompt will appear here..."
                  />
                  <Button
                    onClick={handleCopyToClipboard}
                    disabled={!enhancedPrompt}
                    variant="outline"
                    className="w-full"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Improvements Section */}
            {improvements.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Key Improvements Made
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {improvements.map((improvement, index) => (
                      <div key={`improvement-${improvement.slice(0, 20)}-${index}`} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-sm text-muted-foreground">{improvement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="mt-4 border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive text-sm">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
