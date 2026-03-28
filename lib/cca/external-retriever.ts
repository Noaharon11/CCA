// External Source Retrieval Service
// Fetches regulatory content from whitelisted Israeli government sources

import { createClient } from '@/lib/supabase/server'
import { isTrustedSource, type RetrievedDocument, type TrustedSource } from './types'
import { createHash } from 'crypto'

interface FetchedContent {
  url: string
  title: string
  content: string
  contentHash: string
  fetchedAt: Date
}

// Fetch content from an external URL
async function fetchExternalContent(url: string): Promise<FetchedContent | null> {
  if (!isTrustedSource(url)) {
    console.warn(`[CCA] Attempted to fetch from untrusted source: ${url}`)
    return null
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CCA-Bot/1.0 (Construction Compliance Assistant)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'he,en;q=0.5',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error(`[CCA] Failed to fetch ${url}: ${response.status}`)
      return null
    }

    const html = await response.text()
    
    // Extract text content and title from HTML
    const { title, content } = extractTextFromHtml(html)
    
    // Generate content hash for change detection
    const contentHash = createHash('sha256').update(content).digest('hex')

    return {
      url,
      title,
      content,
      contentHash,
      fetchedAt: new Date(),
    }
  } catch (error) {
    console.error(`[CCA] Error fetching ${url}:`, error)
    return null
  }
}

// Extract readable text from HTML
function extractTextFromHtml(html: string): { title: string; content: string } {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled Document'

  // Remove script and style tags
  let content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
  
  // Remove HTML tags but preserve some structure
  content = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
  
  // Clean up whitespace
  content = content
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { title, content }
}

// Chunk content for embedding
function chunkContent(content: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = []
  let start = 0
  
  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length)
    let chunk = content.slice(start, end)
    
    // Try to break at sentence boundary
    if (end < content.length) {
      const lastPeriod = chunk.lastIndexOf('.')
      const lastNewline = chunk.lastIndexOf('\n')
      const breakPoint = Math.max(lastPeriod, lastNewline)
      
      if (breakPoint > chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1)
      }
    }
    
    chunks.push(chunk.trim())
    start = start + chunk.length - overlap
  }
  
  return chunks.filter(c => c.length > 50)
}

// Get trusted sources from database
export async function getTrustedSources(): Promise<TrustedSource[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('trusted_sources')
    .select('*')
    .eq('is_active', true)

  if (error) {
    console.error('[CCA] Error fetching trusted sources:', error)
    return []
  }

  return data || []
}

// Cache fetched content in the database
// embedding is optional - can be null if embedding service is unavailable
export async function cacheContent(
  sourceId: string,
  fetched: FetchedContent,
  embedding: number[] | null,
  category?: string
): Promise<string | null> {
  const supabase = await createClient()

  // Check if we already have this content (by hash)
  const { data: existing } = await supabase
    .from('cached_documents')
    .select('id, content_hash')
    .eq('source_url', fetched.url)
    .single()

  if (existing && existing.content_hash === fetched.contentHash) {
    // Content unchanged, just update verification timestamp
    await supabase
      .from('cached_documents')
      .update({ last_verified_at: new Date().toISOString() })
      .eq('id', existing.id)
    
    return existing.id
  }

  // Insert or update content
  // Only include embedding if available
  const documentData: Record<string, unknown> = {
    source_id: sourceId,
    source_url: fetched.url,
    retrieved_at: fetched.fetchedAt.toISOString(),
    last_verified_at: fetched.fetchedAt.toISOString(),
    title: fetched.title,
    content: fetched.content,
    content_hash: fetched.contentHash,
    category,
    language: 'he',
    is_stale: false,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
  
  if (embedding) {
    documentData.embedding = embedding
  }

  const { data, error } = await supabase
    .from('cached_documents')
    .upsert(documentData, {
      onConflict: 'source_url',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[CCA] Error caching content:', error)
    return null
  }

  return data?.id || null
}

// Fetch and cache content from a URL
export async function fetchAndCacheContent(
  url: string,
  sourceId: string,
  generateEmbedding: (text: string) => Promise<number[]>,
  category?: string
): Promise<RetrievedDocument | null> {
  const fetched = await fetchExternalContent(url)
  
  if (!fetched) {
    return null
  }

  // Generate embedding for the content
  const embedding = await generateEmbedding(fetched.content.slice(0, 8000))
  
  // Cache in database
  const docId = await cacheContent(sourceId, fetched, embedding, category)
  
  if (!docId) {
    return null
  }

  return {
    id: docId,
    source_url: fetched.url,
    title: fetched.title,
    content: fetched.content,
    retrieved_at: fetched.fetchedAt.toISOString(),
    similarity: 1.0, // Fresh fetch, perfect match
  }
}

// Check cache freshness for a URL
export async function getCachedContent(url: string, maxAgeHours: number = 24): Promise<RetrievedDocument | null> {
  const supabase = await createClient()
  
  const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('cached_documents')
    .select('*')
    .eq('source_url', url)
    .gte('retrieved_at', cutoffTime)
    .eq('is_stale', false)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    source_url: data.source_url,
    title: data.title,
    content: data.content,
    retrieved_at: data.retrieved_at,
    similarity: 1.0,
  }
}

export { fetchExternalContent, chunkContent, extractTextFromHtml }
