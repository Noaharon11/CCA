// Embeddings Service using Vercel AI Gateway
// Used for semantic search over cached regulatory documents

import { embed } from 'ai'
import { createClient } from '@/lib/supabase/server'
import type { RetrievedDocument } from './types'

const EMBEDDING_DIMENSIONS = 1536

// Generate embedding for text using AI SDK (Vercel AI Gateway)
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: 'openai/text-embedding-3-small',
      value: text.slice(0, 8000), // Limit input size
    })
    return embedding
  } catch (error) {
    console.error('[CCA] Error generating embedding:', error)
    throw error
  }
}

// Search cached documents by semantic similarity
// Falls back to keyword search if embeddings are unavailable
export async function searchCachedDocuments(
  query: string,
  options: {
    matchThreshold?: number
    matchCount?: number
    onlyFresh?: boolean
  } = {}
): Promise<RetrievedDocument[]> {
  const {
    matchThreshold = 0.7,
    matchCount = 5,
    onlyFresh = true,
  } = options

  const supabase = await createClient()

  // Try semantic search first
  try {
    const queryEmbedding = await generateEmbedding(query)

    // Search using pgvector
    const { data, error } = await supabase.rpc('search_cached_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      only_fresh: onlyFresh,
    })

    if (!error && data && data.length > 0) {
      return data
    }
  } catch (embeddingError) {
    console.warn('[CCA] Embedding unavailable, falling back to keyword search:', embeddingError)
  }

  // Fallback: keyword-based search using ILIKE
  return await fallbackKeywordSearch(supabase, query, matchCount, onlyFresh)
}

// Keyword-based fallback search when embeddings are unavailable
async function fallbackKeywordSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  matchCount: number,
  onlyFresh: boolean
): Promise<RetrievedDocument[]> {
  // Extract Hebrew keywords from query
  const keywords = query
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 5)

  if (keywords.length === 0) {
    // Return most recent documents if no keywords
    const { data } = await supabase
      .from('cached_documents')
      .select('id, source_url, title, content, retrieved_at')
      .eq('is_stale', false)
      .order('retrieved_at', { ascending: false })
      .limit(matchCount)

    return (data || []).map(doc => ({ ...doc, similarity: 0.5 }))
  }

  // Build OR conditions for keyword search
  const orConditions = keywords
    .map(kw => `content.ilike.%${kw}%,title.ilike.%${kw}%`)
    .join(',')

  let queryBuilder = supabase
    .from('cached_documents')
    .select('id, source_url, title, content, retrieved_at')
    .or(orConditions)
    .order('retrieved_at', { ascending: false })
    .limit(matchCount)

  if (onlyFresh) {
    queryBuilder = queryBuilder.eq('is_stale', false)
  }

  const { data, error } = await queryBuilder

  if (error) {
    console.error('[CCA] Error in keyword search:', error)
    return []
  }

  return (data || []).map(doc => ({ ...doc, similarity: 0.6 }))
}

// Get all cached documents for a specific category
export async function getCachedDocumentsByCategory(category: string): Promise<RetrievedDocument[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cached_documents')
    .select('id, source_url, title, content, retrieved_at')
    .eq('category', category)
    .eq('is_stale', false)
    .order('retrieved_at', { ascending: false })

  if (error) {
    console.error('[CCA] Error fetching documents by category:', error)
    return []
  }

  return (data || []).map(doc => ({
    ...doc,
    similarity: 1.0,
  }))
}

// Mark documents as stale (for cache invalidation)
export async function markDocumentsStale(sourceUrl?: string): Promise<void> {
  const supabase = await createClient()

  const query = supabase
    .from('cached_documents')
    .update({ is_stale: true })

  if (sourceUrl) {
    query.eq('source_url', sourceUrl)
  } else {
    // Mark all documents as stale if no URL specified
    query.lt('expires_at', new Date().toISOString())
  }

  const { error } = await query

  if (error) {
    console.error('[CCA] Error marking documents stale:', error)
  }
}
