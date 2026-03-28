-- CCA Cache Tables
-- IMPORTANT: Database is a CACHE LAYER, not source of truth
-- All data originates from external trusted sources

-- Whitelisted trusted sources
CREATE TABLE IF NOT EXISTS trusted_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached document chunks from external sources
CREATE TABLE IF NOT EXISTS cached_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source provenance (MANDATORY - this is what makes it a cache, not a source)
  source_id UUID REFERENCES trusted_sources(id),
  source_url TEXT NOT NULL,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ,
  
  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  
  -- Metadata
  category TEXT,
  language TEXT DEFAULT 'he',
  
  -- Vector embedding for semantic search (1536 dimensions for text-embedding-3-small)
  embedding vector(1536),
  
  -- Cache management
  is_stale BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS cached_documents_embedding_idx 
  ON cached_documents 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for source lookups
CREATE INDEX IF NOT EXISTS cached_documents_source_url_idx 
  ON cached_documents(source_url);

-- Index for freshness checks
CREATE INDEX IF NOT EXISTS cached_documents_retrieved_at_idx 
  ON cached_documents(retrieved_at);

-- Query logs for traceability
CREATE TABLE IF NOT EXISTS query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The query
  user_query TEXT NOT NULL,
  query_language TEXT DEFAULT 'he',
  
  -- Retrieved context
  retrieved_document_ids UUID[],
  retrieval_scores FLOAT[],
  
  -- AI response
  ai_response TEXT,
  response_sources JSONB,
  
  -- Metadata
  model_used TEXT DEFAULT 'gpt-4o',
  response_time_ms INTEGER,
  from_cache BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answer traceability - links responses to exact source passages
CREATE TABLE IF NOT EXISTS answer_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_log_id UUID REFERENCES query_logs(id) ON DELETE CASCADE,
  document_id UUID REFERENCES cached_documents(id) ON DELETE SET NULL,
  
  -- Exact quote from source
  cited_text TEXT NOT NULL,
  source_url TEXT NOT NULL,
  
  -- Where in the response this citation appears
  citation_index INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to search documents by vector similarity
CREATE OR REPLACE FUNCTION search_cached_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  only_fresh BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id UUID,
  source_url TEXT,
  title TEXT,
  content TEXT,
  retrieved_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cd.id,
    cd.source_url,
    cd.title,
    cd.content,
    cd.retrieved_at,
    1 - (cd.embedding <=> query_embedding) AS similarity
  FROM cached_documents cd
  WHERE 
    cd.embedding IS NOT NULL
    AND (NOT only_fresh OR (cd.expires_at > NOW() AND NOT cd.is_stale))
    AND 1 - (cd.embedding <=> query_embedding) > match_threshold
  ORDER BY cd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
