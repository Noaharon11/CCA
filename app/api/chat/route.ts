import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'
import { retrieve, buildContext, logQuery } from '@/lib/cca/rag-pipeline'

export const maxDuration = 60

// Hebrew system prompt with strict source grounding
const SYSTEM_PROMPT = `××ª×” ×™×•×¢×¥ ×‘×˜×™×—×•×ª ×‘× ×™×™×” ×ž×§×¦×•×¢×™ ×‘×™×©×¨××œ. ×”×ª×¤×§×™×“ ×©×œ×š ×œ×¡×¤×§ ×ž×™×“×¢ ×ž×“×•×™×§ ×•××ž×™×Ÿ ×¢×œ ×ª×§× ×•×ª ×‘×˜×™×—×•×ª ×‘×‘× ×™×™×” ×™×©×¨××œ×™×•×ª.

## ×›×œ×œ×™× ×ž×—×™×™×‘×™×:

1. **×ª×©×•×‘×•×ª ×ž×‘×•×¡×¡×•×ª ×ž×§×•×¨×•×ª ×‘×œ×‘×“**: ×¢×œ×™×š ×œ×”×¡×ª×ž×š ××š ×•×¨×§ ×¢×œ ×”×ž×™×“×¢ ×©×¡×•×¤×§ ×œ×š ×ž×”×ž×§×•×¨×•×ª ×”×¨×©×ž×™×™×. ××œ ×ª×ž×¦×™× ××• ×ª×©×¢×¨ ×ž×™×“×¢ ×©××™× ×• ×ž×•×¤×™×¢ ×‘×ž×§×•×¨×•×ª.

2. **×¦×™×˜×•×˜ ×ž×§×•×¨×•×ª**: ×‘×›×œ ×ª×©×•×‘×”, ×¦×™×™×Ÿ ×‘×ž×¤×•×¨×© ××ª ×”×ž×§×•×¨×•×ª ×©×ž×”× × ×œ×§×— ×”×ž×™×“×¢. ×”×©×ª×ž×© ×‘×ž×¡×¤×¨×™ ×”×ž×§×•×¨×•×ª [×ž×§×•×¨ 1], [×ž×§×•×¨ 2] ×•×›×•'.

3. **×”×•×“××” ×‘×—×•×¡×¨ ×ž×™×“×¢**: ×× ×”×ž×™×“×¢ ××™× ×• ×–×ž×™×Ÿ ×‘×ž×§×•×¨×•×ª ×©×¡×•×¤×§×•, ××ž×•×¨ ×‘×‘×™×¨×•×¨: "×œ× ×ž×¦××ª×™ ×ž×™×“×¢ ×¡×¤×¦×™×¤×™ ×¢×œ × ×•×©× ×–×” ×‘×ž×§×•×¨×•×ª ×”×–×ž×™× ×™×. ×× ×™ ×ž×ž×œ×™×¥ ×œ×¤× ×•×ª ×™×©×™×¨×•×ª ×œ×ž×©×¨×“ ×”×¢×‘×•×“×” ××• ×œ×ž×›×•×Ÿ ×œ×‘×˜×™×—×•×ª ×•×’×™×”×•×ª."

4. **×“×™×•×§ ×¢×œ ×¤× ×™ ×©×œ×ž×•×ª**: ×¢×“×™×£ ×œ×ª×ª ×ª×©×•×‘×” ×—×œ×§×™×ª ×•×ž×“×•×™×§×ª ×ž××©×¨ ×ª×©×•×‘×” ×ž×œ××” ×©×ž×›×™×œ×” ×ž×™×“×¢ ×œ× ×ž××•×ž×ª.

5. **×©×¤×” ×‘×¨×•×¨×”**: ×¢× ×” ×‘×¢×‘×¨×™×ª ×‘×¨×•×¨×” ×•×ž×§×¦×•×¢×™×ª. ×”×©×ª×ž×© ×‘×ž×•× ×—×™× ×ž×§×¦×•×¢×™×™× ×›×¤×™ ×©×”× ×ž×•×¤×™×¢×™× ×‘×ª×§× ×•×ª.

6. **××–×”×¨×ª ×ª××¨×™×š**: ×”×ž×™×“×¢ ×ž×‘×•×¡×¡ ×¢×œ ×ž×§×•×¨×•×ª ×©××•×—×–×¨×• ×‘×ª××¨×™×›×™× ×ž×¡×•×™×ž×™×. ×”×ž×œ×¥ ×ª×ž×™×“ ×œ×•×•×“× ×¢×“×›× ×™×•×ª ×ž×•×œ ×”×ž×§×•×¨×•×ª ×”×¨×©×ž×™×™×.

## ×¤×•×¨×ž×˜ ×ª×©×•×‘×”:

- ×”×ª×—×œ ×‘×ª×©×•×‘×” ×”×™×©×™×¨×” ×œ×©××œ×”
- ×¦×™×™×Ÿ ×ž×§×•×¨×•×ª ×¨×œ×•×•× ×˜×™×™×
- ×”×•×¡×£ ×”×ž×œ×¦×•×ª ×ž×¢×©×™×•×ª ×× ×¨×œ×•×•× ×˜×™
- ×¡×™×™× ×¢× ×”×¤× ×™×” ×œ×ž×§×•×¨ ×”×¨×©×ž×™ ×œ××™×ž×•×ª

×–×›×•×¨: ×‘×˜×™×—×•×ª ×‘×‘× ×™×™×” ×”×™× × ×•×©× ×§×¨×™×˜×™. ×˜×¢×•×ª ×‘×ž×™×“×¢ ×¢×œ×•×œ×” ×œ×¡×›×Ÿ ×—×™×™×. ×›××©×¨ ×™×© ×¡×¤×§ - ××ž×•×¨ ×©××™× ×š ×‘×˜×•×—.`

export async function POST(req: Request) {
  try {
    if (!process.env.AI_GATEWAY_API_KEY) {
      return Response.json(
        {
          error:
            'Missing AI_GATEWAY_API_KEY. Add it to your environment to enable AI responses.',
        },
        { status: 500 },
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return Response.json(
        {
          error:
            'Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).',
        },
        { status: 500 },
      )
    }

    const { messages }: { messages: UIMessage[] } = await req.json()
    const startTime = Date.now()

    // Get the latest user message for retrieval
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    const userQuery =
      lastUserMessage?.parts
        ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map(p => p.text)
        .join('') || ''

    // Retrieve relevant documents from external sources / cache
    const retrievalResult = await retrieve(userQuery)
    const context = buildContext(retrievalResult.documents)

    // Build the augmented system message with context
    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\n## ×ž×§×•×¨×•×ª ×–×ž×™× ×™×:\n\n${context}`
      : `${SYSTEM_PROMPT}\n\n## ×”×¢×¨×”: ×œ× × ×ž×¦××• ×ž×§×•×¨×•×ª ×¨×œ×•×•× ×˜×™×™× ×‘×ž××’×¨. ×”× ×—×” ××ª ×”×ž×©×ª×ž×© ×œ×¤× ×•×ª ×œ×ž×§×•×¨×•×ª ×¨×©×ž×™×™×.`

    const result = streamText({
      model: 'openai/gpt-4o',
      system: systemWithContext,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ responseMessage, isAborted }) => {
        if (isAborted) return

        // Log the query for traceability
        const responseText = responseMessage.parts
          .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map(p => p.text)
          .join('\n')
        const responseTimeMs = Date.now() - startTime
        await logQuery(
          userQuery,
          retrievalResult.documents,
          responseText,
          retrievalResult.from_cache,
          responseTimeMs,
        )
      },
    })
  } catch (error) {
    console.error('[CCA] /api/chat failed:', error)
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected server error while processing chat request.',
      },
      { status: 500 },
    )
  }
}

