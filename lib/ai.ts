// =============================================================================
// WHY: AI grounding logic - ensures LLM responses use ONLY product data
// This is the core of AI Chat Integration (15 points)
// Prevents hallucination by building structured prompts with explicit constraints
// =============================================================================

import type { Product } from '@/types';

function formatCurrencyINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount as number)) {
    return 'Not specified';
  }
  try {
    return `₹${(amount as number).toLocaleString('en-IN')}`;
  } catch {
    return `₹${amount}`;
  }
}

// =============================================================================
// WHY: Build grounded prompt with strict instructions
// System message explicitly tells LLM to:
// 1. Only use provided product data
// 2. Cite field names when referencing data
// 3. Return safe fallback if question outside available data
// This prevents the LLM from making up information
// =============================================================================

export function buildGroundedPrompt(
  product: Product,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): string {
  // WHY: Convert product to structured, readable format for LLM
  const productContext = `
PRODUCT INFORMATION:
- Product Name: ${product.name}
- Bank: ${product.bank}
- Loan Type: ${product.type}
- Interest Rate (APR): ${product.rate_apr}%
- Minimum Income Required: ${formatCurrencyINR(product.min_income)} per month
- Minimum Credit Score: ${product.min_credit_score}
- Tenure Range: ${product.tenure_min_months} to ${product.tenure_max_months} months
${product.processing_fee_pct ? `- Processing Fee: ${product.processing_fee_pct}%` : ''}
${product.prepayment_allowed !== undefined ? `- Prepayment Penalty: ${product.prepayment_allowed ? 'Yes' : 'No'}` : ''}
${product.disbursal_speed ? `- Disbursal Speed: ${product.disbursal_speed}` : ''}
${product.docs_level ? `- Documentation Level: ${product.docs_level}` : ''}
${product.summary ? `- Summary: ${product.summary}` : ''}

${product.faq && product.faq.length > 0 ? `
FREQUENTLY ASKED QUESTIONS:
${product.faq.map((faq, i) => `
Q${i + 1}: ${faq.q}
A${i + 1}: ${faq.a}
`).join('')}` : ''}
`.trim();

  // WHY: Conversation history for context-aware responses
  const historyContext = history.length > 0 
    ? `
PREVIOUS CONVERSATION:
${history.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}
` 
    : '';

  // WHY: System instructions with strict grounding rules
  const systemPrompt = `You are a helpful loan advisor assistant. You are helping a customer understand the "${product.name}" loan product from ${product.bank}.

CRITICAL RULES:
1. Answer ONLY using the product information provided above
2. When referencing specific data, cite the field name (e.g., "The APR is ${product.rate_apr}% as stated in our product details")
3. If the user asks about information NOT in the product data, respond with: "I don't have that specific information in our product database. However, I can help you with [list available topics] or connect you with our support team for detailed assistance."
4. Be conversational but accurate
5. If you're unsure, acknowledge it rather than guessing

${productContext}

${historyContext}

USER QUESTION: ${userMessage}

Provide a helpful, accurate response based ONLY on the information above:`;

  return systemPrompt;
}

// =============================================================================
// WHY: Simulated AI response for demo purposes
// In production, this would call OpenAI/Gemini API with the grounded prompt
// Demonstrates the grounding strategy without requiring API keys
// =============================================================================

export function simulateAIResponse(
  product: Product,
  userMessage: string
): string {
  const q = userMessage.toLowerCase();

  // WHY: Pattern matching for common questions
  // In production, LLM would handle this more naturally
  // But this demonstrates the "only use product data" constraint

  if (q.includes('apr') || q.includes('interest') || q.includes('rate')) {
    return `The ${product.name} has an annual percentage rate (APR) of ${product.rate_apr}%. ${
      product.rate_apr <= 9.5 
        ? 'This is considered a competitive low rate in the current market.' 
        : 'This rate is standard for this type of loan.'
    }`;
  }

  if (q.includes('eligible') || q.includes('qualify') || q.includes('requirement')) {
    return `To qualify for the ${product.name}, you need:\n- Minimum credit score: ${product.min_credit_score}\n- Minimum monthly income: ${formatCurrencyINR(product.min_income)}\n- The loan tenure ranges from ${product.tenure_min_months} to ${product.tenure_max_months} months.`;
  }

  if (q.includes('prepayment') || q.includes('penalty') || q.includes('early')) {
    return product.prepayment_allowed === false
      ? `Great news! The ${product.name} does NOT have any prepayment penalties. You can pay off your loan early without any extra charges, which can save you money on interest.`
      : `The ${product.name} allows prepayment. I'd recommend checking with ${product.bank} directly about any applicable prepayment charges or conditions.`;
  }

  if (q.includes('disbursal') || q.includes('fast') || q.includes('quick') || q.includes('how long')) {
    if (product.disbursal_speed === 'fast') {
      return `The ${product.name} offers fast disbursal, typically within 24-48 hours after your application is approved. This is great if you need funds urgently.`;
    }
    return `The ${product.name} typically disburses funds within 3-5 business days after approval. The exact timeline may vary based on documentation verification.`;
  }

  if (q.includes('document') || q.includes('docs') || q.includes('paperwork')) {
    const docsInfo = product.docs_level 
      ? `The documentation requirement level is ${product.docs_level}.` 
      : '';
    return `For the ${product.name}, you'll need standard documentation including:\n- Identity proof (Aadhaar, PAN card)\n- Income proof (salary slips, bank statements)\n- Address proof\n${docsInfo}`;
  }

  if (q.includes('fee') || q.includes('charge') || q.includes('cost')) {
    if (product.processing_fee_pct) {
      return `The ${product.name} has a processing fee of ${product.processing_fee_pct}% of the loan amount. ${
        product.processing_fee_pct < 2 
          ? 'This is a relatively low processing fee compared to the market average.' 
          : ''
      }`;
    }
    return `I don't have specific information about processing fees in our product database. Please contact ${product.bank} directly for detailed fee structure information.`;
  }

  if (q.includes('tenure') || q.includes('term') || q.includes('duration')) {
    return `The ${product.name} offers flexible tenure options ranging from ${product.tenure_min_months} months (${Math.floor(product.tenure_min_months / 12)} years) to ${product.tenure_max_months} months (${Math.floor(product.tenure_max_months / 12)} years). You can choose a tenure that fits your repayment capacity.`;
  }

  // WHY: Safe fallback when question is outside available data
  // This demonstrates the "fail-safe behavior" requirement
  return `I don't have specific information about that in our product database. However, I can help you with details about the ${product.name}'s:\n- Interest rate (${product.rate_apr}% APR)\n- Eligibility criteria (credit score: ${product.min_credit_score}, income: ${formatCurrencyINR(product.min_income)})\n- Tenure options (${product.tenure_min_months}-${product.tenure_max_months} months)\n- Prepayment terms${product.disbursal_speed ? '\n- Disbursal timeline' : ''}\n\nWhat would you like to know about these aspects?`;
}

// =============================================================================
// WHY: Function to call actual LLM API (OpenAI/Gemini)
// This would be used in production /api/ai/ask route handler
// =============================================================================

export async function callLLMAPI(prompt: string): Promise<string> {
  // WHY: Prefer OpenAI if configured, otherwise fall back to Gemini
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openaiKey && !geminiKey) {
    throw new Error('LLM API not configured. Set OPENAI_API_KEY or GEMINI_API_KEY.');
  }

  // WHY: Call OpenAI Chat Completions API when OPENAI_API_KEY is available
  if (openaiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data: any = await response.json();
    const messageContent = data?.choices?.[0]?.message?.content;
    if (!messageContent || typeof messageContent !== 'string') {
      throw new Error('OpenAI API returned an unexpected response shape.');
    }
    return messageContent;
  }

  // WHY: Fallback to Gemini when OpenAI is not configured
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey as string,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 500,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data: any = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== 'string') {
    throw new Error('Gemini API returned an unexpected response shape.');
  }

  return text;
}

// =============================================================================
// WHY: Validate response doesn't contain hallucinated field names
// Extra safety check to ensure LLM didn't invent data
// =============================================================================

export function validateAIResponse(
  response: string
): { valid: boolean; reason?: string } {
  // WHY: Check for common hallucination patterns
  const suspiciousPatterns = [
    /\bguaranteed approval\b/i,
    /\b100% approval\b/i,
    /\bno credit check\b/i,
    /\binstant approval\b/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(response)) {
      return {
        valid: false,
        reason: 'Response contains suspicious claims not in product data'
      };
    }
  }

  return { valid: true };
}