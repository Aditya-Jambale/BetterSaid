import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { UsageService } from '@/lib/usageService';
import { GoogleGenAI } from '@google/genai';

// NOTE: Do NOT throw at module scope for missing env vars; respond gracefully instead.
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';

interface UsageCheckResult {
  canUse: boolean;
  currentUsage: number;
  limit: number;
  remaining: number;
}

interface GeminiStructuredResponse {
  enhanced_prompt?: string;
  enhancedPrompt?: string;
  improvements?: string[];
  [key: string]: unknown;
}
interface PlanQuery { plan: string }

function determinePlan(has: (q: PlanQuery) => boolean): string {
  if (has({ plan: 'business' })) return 'business';
  if (has({ plan: 'pro' })) return 'pro';
  if (has({ plan: 'starter' })) return 'starter';
  return 'free';
}

async function safeCheckUsage(userId: string, currentPlan: string): Promise<UsageCheckResult> {
  try {
    return await UsageService.checkUsageLimit(userId, currentPlan);
  } catch (e) {
    console.error('Error checking usage limits:', e);
    return { canUse: true, currentUsage: 0, limit: 25, remaining: 25 };
  }
}

function buildSystemInstruction(prompt: string): string {
  return `
You are an expert Prompt Enhancement AI that transforms user inputs into highly effective prompts using advanced prompt engineering techniques proven to maximize LLM performance.

<analysis_phase>
  Before enhancing any prompt, conduct this systematic analysis:
1. ** Intent Classification **: Determine the prompt type(coding / technical, creative writing, analysis / research, conversation / chat, data processing, visual / UI generation)
2. ** Complexity Assessment **: Evaluate if this requires single - step or multi - step reasoning
3. ** Output Requirements **: Identify desired format, length, style, and technical specifications
4. ** Context Gaps **: Find missing background information, constraints, or success criteria
5. ** Ambiguity Detection **: Identify vague language, unclear references, or conflicting instructions
  </analysis_phase>

  <enhancement_techniques>
Apply these proven techniques based on prompt type:

** Universal Enhancements **:
- Add clear role assignment(e.g., "You are an expert data analyst...")
  - Include chain - of - thought instructions for complex reasoning
    - Structure with XML tags for clarity(<context>, <task>, <constraints>, <output_format>)
      - Specify exact output format with examples
      - Add success criteria and quality metrics
        - Include "let's think step by step" for reasoning tasks
          - Remove contradictory or ambiguous instructions

            ** Type - Specific Enhancements **:

For CODING prompts:
- Specify language, framework, and version requirements
  - Include error handling and edge case instructions
    - Add code style preferences(verbose variable names, commenting standards)
      - Define testing and validation requirements
        - Include directory structure if relevant

For CREATIVE WRITING:
- Define tone, style, and voice parameters
  - Specify length constraints precisely
    - Include genre conventions and audience
      - Add emotional beats or story structure

For ANALYSIS / RESEARCH:
- Include source preference and citation requirements
  - Specify depth of analysis needed
    - Add data handling instructions
      - Include bias awareness notes

For DATA PROCESSING:
- Specify input / output formats explicitly
  - Include data validation rules
    - Add error handling for edge cases
      - Define transformation logic clearly
        </enhancement_techniques>

        <enhancement_patterns>
Apply these structural patterns:

** Pattern 1: Context - Task - Constraints - Output **
  <context>[Background information] </context>
  < task > [Specific instructions] </task>
  < constraints > [Limitations and requirements] </constraints>
  < output_format > [Exact format needed] </output_format>

  ** Pattern 2: Few - Shot Examples **
    When beneficial, include 2 - 3 examples showing:
- Input → Expected Output
  - Good vs Bad outputs
    - Edge case handling

      ** Pattern 3: Progressive Refinement **
        For complex tasks, break into phases:
1. Initial analysis / planning
2. Core execution
3. Validation and refinement
4. Final output formatting
  </enhancement_patterns>

  < meta_enhancement_rules >
  - If original prompt < 20 words: Expand with context, examples, and specifications
    - If original prompt lacks structure: Apply XML formatting
      - If original prompt is ambiguous: Add specific parameters and constraints
        - If original prompt requests creativity: Add style guides and quality rubrics
          - If original prompt involves reasoning: Add "think step-by-step" instructions
            - Always preserve user's core intent while maximizing clarity
              - Never add unnecessary complexity; enhance for effectiveness
                </meta_enhancement_rules>

                <response_generation>
Your enhanced prompt should:
1. Start with a clear role assignment
2. Provide necessary context
3. State the task explicitly
4. Include relevant constraints
5. Specify output format
6. Add quality criteria
7. Include examples if helpful
8. Use structured formatting(XML tags or markdown)
  </response_generation>

## OUTPUT REQUIREMENT
You MUST return your response as a valid JSON object with this EXACT structure:

{
  "enhanced_prompt": "[Complete enhanced prompt ready for direct use]",
    "improvements": [
      "[Improvement 1: Specific technique applied and why]",
      "[Improvement 2: Specific technique applied and why]",
      "[Improvement 3: Specific technique applied and why]",
      "[Additional improvements as needed, typically 3-5 total]"
    ]
}

Rules for JSON response:
  - Return ONLY the JSON object
    - No markdown code blocks around the JSON
      - No additional text before or after
        - The enhanced_prompt should be a complete, self - contained prompt
          - Each improvement should be specific and actionable
            - Improvements should reference the techniques applied

Now, enhance the following user prompt:
"${prompt.trim()}"
  `;
}

type GeminiError = { error: string; status?: number; details?: string };
type GeminiSuccess = { data: GeminiStructuredResponse };
type GeminiResult = GeminiError | GeminiSuccess;

function isGeminiError(res: GeminiResult): res is GeminiError {
  return 'error' in res;
}

async function callGemini(systemInstruction: string): Promise<GeminiResult> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { error: 'Server configuration error: GEMINI_API_KEY not set', status: 500 };
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const config = {
      responseMimeType: 'application/json',
      temperature: 0.5,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: systemInstruction,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config,
      contents,
    });

    const textPayload = response.text;

    if (!textPayload) {
      return { error: 'AI response missing content', status: 502 };
    }

    let geminiJson: GeminiStructuredResponse | null = null;
    try {
      geminiJson = JSON.parse(textPayload);
    } catch (jsonErr) {
      const regex = /\{[\s\S]*\}/g;
      const execResult = regex.exec(textPayload);
      if (execResult?.[0]) {
        try {
          geminiJson = JSON.parse(execResult[0]);
        } catch (innerErr) {
          console.error('Failed to parse extracted JSON from AI response', innerErr);
          return { error: 'Failed to parse AI JSON response', status: 500 };
        }
      } else {
        console.error('No JSON object found in AI response', jsonErr);
        return { error: 'AI response not in expected JSON format', status: 500 };
      }
    }

    if (!geminiJson) {
      return { error: 'Empty AI JSON payload', status: 500 };
    }
    return { data: geminiJson };

  } catch (error) {
    console.error('Gemini SDK Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown SDK error';
    return {
      error: 'Failed to get response from Gemini API',
      status: 502,
      details: errorMessage
    };
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('Enhance route: GEMINI_API_KEY is missing');
      return NextResponse.json({ error: 'Server configuration error: enhancement model API key not set. Please configure GEMINI_API_KEY.' }, { status: 500 });
    }

    const { userId, has } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to continue.', requiresAuth: true }, { status: 401 });
    }

    const currentPlan = determinePlan(has);
    // Check unlimited flag via Clerk metadata
    let isUnlimited = false;
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      isUnlimited = (user.publicMetadata as Record<string, unknown> | null | undefined)?.unlimited_enhancements === true;
    } catch (e) {
      console.warn('Failed to fetch user metadata for unlimited check:', e);
    }

    const usageCheck = isUnlimited
      ? { canUse: true, currentUsage: 0, limit: -1, remaining: 0 }
      : await safeCheckUsage(userId, currentPlan);
    if (!usageCheck.canUse) {
      return NextResponse.json({
        error: 'Usage limit exceeded for this month',
        planInfo: { currentPlan, monthlyLimit: usageCheck.limit, remainingUsage: usageCheck.remaining, currentUsage: usageCheck.currentUsage },
        requiresUpgrade: true
      }, { status: 429 });
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Invalid prompt provided' }, { status: 400 });
    }

    console.log('[ENHANCE] Incoming request user:', userId, 'plan:', currentPlan, 'prompt chars:', prompt.length);
    const systemInstruction = buildSystemInstruction(prompt);

    let geminiResult: GeminiResult;
    try {
      console.log('[ENHANCE] Calling Gemini API...');
      geminiResult = await callGemini(systemInstruction);
      console.log('[ENHANCE] Gemini call completed');
    } catch (networkErr) {
      console.error('Network/Fetch error calling Gemini:', networkErr);
      return NextResponse.json({ error: 'Failed to contact enhancement model service', details: (networkErr as Error)?.message }, { status: 502 });
    }
    if (isGeminiError(geminiResult)) {
      return NextResponse.json({ error: geminiResult.error, details: geminiResult.details }, { status: geminiResult.status || 500 });
    }
    const geminiJson = geminiResult.data;
    if (!geminiJson || typeof geminiJson !== 'object') {
      return NextResponse.json({ error: 'Empty or invalid AI response' }, { status: 500 });
    }
    const enhancedPromptValue = geminiJson.enhanced_prompt || geminiJson.enhancedPrompt;
    const improvementsValue = Array.isArray(geminiJson.improvements) ? geminiJson.improvements : [];
    if (!enhancedPromptValue) {
      return NextResponse.json({ error: 'AI response missing enhanced prompt' }, { status: 500 });
    }

    // Increment usage count after successful enhancement
    let newUsageCount = usageCheck.currentUsage;
    let updatedUsageCheck = usageCheck;

    if (!isUnlimited) {
      try {
        newUsageCount = await UsageService.incrementUsage(userId);
        updatedUsageCheck = await UsageService.checkUsageLimit(userId, currentPlan);
      } catch (usageError) {
        console.error('Error updating usage count:', usageError);
        // Continue with the response even if usage tracking fails
      }
    }

    return NextResponse.json({
      enhancedPrompt: enhancedPromptValue,
      improvements: improvementsValue,
      planInfo: {
        currentPlan: isUnlimited ? 'unlimited' : currentPlan,
        monthlyLimit: updatedUsageCheck.limit,
        remainingUsage: updatedUsageCheck.remaining,
        currentUsage: isUnlimited ? 0 : newUsageCount
      }
    });

  } catch (error) {
    console.error('Error in enhance API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}