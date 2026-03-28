// RAG Pipeline Service
// Orchestrates retrieval from external sources and cache

import { createClient } from '@/lib/supabase/server'
import { searchCachedDocuments, generateEmbedding } from './embeddings'
import { getTrustedSources, fetchAndCacheContent, getCachedContent } from './external-retriever'
import type { RetrievalResult, RetrievedDocument, SourceCitation } from './types'

// Known regulatory URLs for different topics
const REGULATORY_URLS: Record<string, string[]> = {
  'working_at_heights': [
    'https://www.gov.il/he/departments/policies/construction_safety_at_heights',
    'https://www.osh.org.il/safety/construction/heights',
  ],
  'scaffolding': [
    'https://www.gov.il/he/departments/policies/scaffolding_regulations',
    'https://www.osh.org.il/safety/construction/scaffolding',
  ],
  'ladders': [
    'https://www.gov.il/he/departments/policies/ladder_safety',
    'https://www.osh.org.il/safety/equipment/ladders',
  ],
  'ppe': [
    'https://www.gov.il/he/departments/policies/ppe_requirements',
    'https://www.osh.org.il/safety/ppe',
  ],
  'general': [
    'https://www.gov.il/he/departments/policies/construction_safety',
    'https://www.osh.org.il/safety/construction',
  ],
}

// Detect topic from Hebrew query
function detectTopic(query: string): string {
  const queryLower = query.toLowerCase()
  
  if (queryLower.includes('גובה') || queryLower.includes('נפילה') || queryLower.includes('height')) {
    return 'working_at_heights'
  }
  if (queryLower.includes('פיגום') || queryLower.includes('scaffolding')) {
    return 'scaffolding'
  }
  if (queryLower.includes('סולם') || queryLower.includes('ladder')) {
    return 'ladders'
  }
  if (queryLower.includes('ציוד מגן') || queryLower.includes('קסדה') || queryLower.includes('ppe') || queryLower.includes('helmet')) {
    return 'ppe'
  }
  
  return 'general'
}

// Main retrieval function - External first, then cache
export async function retrieve(query: string): Promise<RetrievalResult> {
  const startTime = Date.now()
  const documents: RetrievedDocument[] = []
  let fromCache = false

  // 1. First, try semantic search on cached documents
  const cachedDocs = await searchCachedDocuments(query, {
    matchThreshold: 0.75,
    matchCount: 5,
    onlyFresh: true,
  })

  if (cachedDocs.length > 0) {
    documents.push(...cachedDocs)
    fromCache = true
  }

  // 2. If cache results are insufficient, attempt external retrieval
  if (documents.length < 3) {
    const topic = detectTopic(query)
    const relevantUrls = REGULATORY_URLS[topic] || REGULATORY_URLS['general']
    const sources = await getTrustedSources()
    
    // Find matching source for the URLs
    const defaultSource = sources[0]
    
    if (defaultSource) {
      for (const url of relevantUrls) {
        // First check if we have fresh cached content
        const cached = await getCachedContent(url, 24)
        
        if (cached) {
          // Check if it's not already in our results
          if (!documents.find(d => d.source_url === cached.source_url)) {
            documents.push(cached)
          }
        } else {
          // Fetch fresh content
          try {
            const freshDoc = await fetchAndCacheContent(
              url,
              defaultSource.id,
              generateEmbedding,
              topic
            )
            
            if (freshDoc && !documents.find(d => d.source_url === freshDoc.source_url)) {
              documents.push(freshDoc)
              fromCache = false
            }
          } catch (error) {
            console.error(`[CCA] Failed to fetch ${url}:`, error)
          }
        }
      }
    }
  }

  return {
    documents: documents.slice(0, 5), // Limit to 5 documents
    from_cache: fromCache,
    retrieval_time_ms: Date.now() - startTime,
  }
}

// Log query and response for traceability
export async function logQuery(
  userQuery: string,
  documents: RetrievedDocument[],
  aiResponse: string,
  fromCache: boolean,
  responseTimeMs: number
): Promise<string | null> {
  const supabase = await createClient()

  const responseSources: SourceCitation[] = documents.map((doc, index) => ({
    source_url: doc.source_url,
    title: doc.title,
    cited_text: doc.content.slice(0, 500),
    retrieved_at: doc.retrieved_at,
    similarity_score: doc.similarity,
  }))

  const { data, error } = await supabase
    .from('query_logs')
    .insert({
      user_query: userQuery,
      query_language: 'he',
      retrieved_document_ids: documents.map(d => d.id),
      retrieval_scores: documents.map(d => d.similarity),
      ai_response: aiResponse,
      response_sources: responseSources,
      model_used: 'gpt-4o',
      response_time_ms: responseTimeMs,
      from_cache: fromCache,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[CCA] Error logging query:', error)
    return null
  }

  // Log individual citations
  if (data?.id) {
    const citations = documents.map((doc, index) => ({
      query_log_id: data.id,
      document_id: doc.id,
      cited_text: doc.content.slice(0, 1000),
      source_url: doc.source_url,
      citation_index: index,
    }))

    await supabase.from('answer_citations').insert(citations)
  }

  return data?.id || null
}

// Build context string for AI from retrieved documents
export function buildContext(documents: RetrievedDocument[]): string {
  if (documents.length === 0) {
    return ''
  }

  const contextParts = documents.map((doc, index) => {
    const retrievedDate = new Date(doc.retrieved_at).toLocaleDateString('he-IL')
    return `
[מקור ${index + 1}]
כותרת: ${doc.title}
קישור: ${doc.source_url}
תאריך אחזור: ${retrievedDate}
תוכן:
${doc.content.slice(0, 2000)}
---`
  })

  return contextParts.join('\n\n')
}

// Format sources for display in chat
export function formatSourcesForDisplay(documents: RetrievedDocument[]): SourceCitation[] {
  return documents.map(doc => ({
    source_url: doc.source_url,
    title: doc.title,
    cited_text: doc.content.slice(0, 300) + '...',
    retrieved_at: doc.retrieved_at,
    similarity_score: doc.similarity,
  }))
}
