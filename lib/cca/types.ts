// CCA Types - Construction Compliance Assistant

export interface TrustedSource {
  id: string
  name: string
  base_url: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface CachedDocument {
  id: string
  source_id: string | null
  source_url: string
  retrieved_at: string
  last_verified_at: string | null
  title: string
  content: string
  content_hash: string
  category: string | null
  language: string
  embedding: number[] | null
  is_stale: boolean
  expires_at: string
  created_at: string
  updated_at: string
}

export interface QueryLog {
  id: string
  user_query: string
  query_language: string
  retrieved_document_ids: string[]
  retrieval_scores: number[]
  ai_response: string | null
  response_sources: SourceCitation[]
  model_used: string
  response_time_ms: number | null
  from_cache: boolean
  created_at: string
}

export interface SourceCitation {
  source_url: string
  title: string
  cited_text: string
  retrieved_at: string
  similarity_score: number
}

export interface RetrievalResult {
  documents: RetrievedDocument[]
  from_cache: boolean
  retrieval_time_ms: number
}

export interface RetrievedDocument {
  id: string
  source_url: string
  title: string
  content: string
  retrieved_at: string
  similarity: number
}

// Whitelisted domains for external retrieval
export const WHITELISTED_DOMAINS = [
  'gov.il',
  'osh.org.il',
  'sii.org.il',
  'labor.gov.il',
] as const

export type WhitelistedDomain = typeof WHITELISTED_DOMAINS[number]

// Check if a URL is from a trusted source
export function isTrustedSource(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return WHITELISTED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}
