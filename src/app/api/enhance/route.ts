// app/api/enhance/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UsageService } from '@/lib/usageService';

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not configured');
  // Throw an error during build time or server start if the key is missing
  throw new Error('Server configuration error: GEMINI_API_KEY is missing.');
}

const MODEL_NAME = 'gemini-2.5-flash-lite-preview-06-17'; // Use -latest for automatic updates
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${process.env.GEMINI_API_KEY}`;

export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId, has } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.', requiresAuth: true },
        { status: 401 }
      );
    }

    // Determine user's plan
    const hasStarterPlan = has({ plan: 'starter' });
    const hasProPlan = has({ plan: 'pro' });
    const hasBusinessPlan = has({ plan: 'business' });
    
    let currentPlan = 'free';
    if (hasBusinessPlan) currentPlan = 'business';
    else if (hasProPlan) currentPlan = 'pro';
    else if (hasStarterPlan) currentPlan = 'starter';

    // Check usage limits
    let usageCheck;
    try {
      usageCheck = await UsageService.checkUsageLimit(userId, currentPlan);
    } catch (usageError) {
      console.error('Error checking usage limits:', usageError);
      // Allow the request to proceed if usage check fails, but log the error
      usageCheck = { canUse: true, currentUsage: 0, limit: 25, remaining: 25 };
    }
    
    if (!usageCheck.canUse) {
      return NextResponse.json({
        error: 'Usage limit exceeded for this month',
        planInfo: {
          currentPlan,
          monthlyLimit: usageCheck.limit,
          remainingUsage: usageCheck.remaining,
          currentUsage: usageCheck.currentUsage
        },
        requiresUpgrade: true
      }, { status: 429 });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Invalid prompt provided' }, { status: 400 });
    }

    // A more concise prompt, designed for JSON mode.
    // We describe the desired output, and JSON mode handles the formatting.
    const systemInstruction = `
You are an expert Prompt Enhancement AI designed to transform user inputs into highly effective, results-oriented prompts that maximize LLM performance and output quality.

## Your Enhancement Process:
1. **Analyze** the user's intent and desired outcome
2. **Identify gaps** in specificity, context, and structure  
3. **Apply enhancement techniques** systematically
4. **Return structured response** with enhanced prompt and improvements

## Enhancement Techniques You Apply:
- **Specificity**: Add concrete details, examples, and parameters
- **Context**: Provide necessary background and constraints
- **Structure**: Use clear formatting, step-by-step instructions, and output templates
- **Clarity**: Remove ambiguity and define technical terms
- **Actionability**: Include specific tasks, roles, and success criteria
- **Output Format**: Specify desired length, style, and presentation format

## Enhancement Principles:
- Transform vague requests into precise instructions
- Add relevant context without overwhelming detail
- Include examples when they improve understanding
- Specify output format and constraints
- Break complex requests into clear steps
- Add role-playing elements when beneficial
- Include quality criteria and success metrics

## CRITICAL: Your Response Format
Return your response as a valid JSON object with this exact structure:
{
  "enhanced_prompt": "The complete improved prompt text that is ready to be copied and pasted directly into any AI system",
  "improvements": [
    "Brief explanation of key improvement 1 (e.g., 'Added specific role and context')",
    "Brief explanation of key improvement 2 (e.g., 'Structured output format specified')",
    "Brief explanation of key improvement 3 (e.g., 'Included concrete examples and constraints')"
  ]
}

Return ONLY this JSON object with no additional text, formatting, or commentary outside the JSON structure. The enhanced_prompt field should contain the complete, ready-to-use prompt that maximizes LLM effectiveness and output quality. "${prompt.trim()}"
`;

    const requestBody = {
      contents: [{ parts: [{ text: systemInstruction }] }],
      generationConfig: {
        // ** THIS IS THE KEY FIX **
        response_mime_type: 'application/json',
        temperature: 0.5, // Lower temperature for more predictable JSON output
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Gemini API Error:', errorBody);
      return NextResponse.json(
        { error: 'Failed to get response from Gemini API', details: errorBody.error?.message ?? 'Unknown error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    // In JSON mode, the response in `parts[0].text` is already a valid JSON string.
    // The Gemini API client libraries often parse this for you, but with fetch, we get the text.
    // Let's safely parse it.
    if (!candidate?.content?.parts?.[0]?.text) {
        console.error('Invalid response structure from Gemini:', data);
        return NextResponse.json({ error: 'Failed to parse response from AI service' }, { status: 500 });
    }
    
    // The text part itself is the JSON string we need to parse.
    const parsedResponse = JSON.parse(candidate.content.parts[0].text);

    // Increment usage count after successful enhancement
    let newUsageCount = usageCheck.currentUsage;
    let updatedUsageCheck = usageCheck;
    
    try {
      newUsageCount = await UsageService.incrementUsage(userId);
      updatedUsageCheck = await UsageService.checkUsageLimit(userId, currentPlan);
    } catch (usageError) {
      console.error('Error updating usage count:', usageError);
      // Continue with the response even if usage tracking fails
    }

    return NextResponse.json({
      enhancedPrompt: parsedResponse.enhanced_prompt,
      improvements: parsedResponse.improvements,
      planInfo: {
        currentPlan,
        monthlyLimit: updatedUsageCheck.limit,
        remainingUsage: updatedUsageCheck.remaining,
        currentUsage: newUsageCount
      }
    });

  } catch (error) {
    console.error('Error in enhance API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}