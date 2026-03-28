-- Seed sample documents for CCA MVP demonstration
-- These represent cached content from official Israeli regulatory sources

-- Get the first trusted source ID for our seeds
WITH first_source AS (
  SELECT id FROM trusted_sources LIMIT 1
)
INSERT INTO cached_documents (
  source_id,
  source_url,
  title,
  content,
  content_hash,
  category,
  language,
  retrieved_at,
  last_verified_at,
  expires_at,
  is_stale
)
VALUES
  (
    (SELECT id FROM first_source),
    'https://www.gov.il/he/departments/policies/working_at_heights',
    'תקנות בנייה - עבודה בגובה',
    'עבודה בגובה: עובדים החייבים לעבוד בגובה של 2 מטרים או יותר מעל הקרקע או משטח עבודה אחר חייבים בחגורת בטיחות. השימוש בחגורת בטיחות הוא חובה בעבודה בגובה לצורך מניעת נפילות. כל עובד חייב לקבל הדרכה בהשתמשו בציוד בטיחות. נקודות זיקה חייבות להיות חזקות ויציבות.',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'working_at_heights',
    'he',
    NOW(),
    NOW(),
    NOW() + INTERVAL '24 hours',
    false
  ),
  (
    (SELECT id FROM first_source),
    'https://www.osh.org.il/safety/construction/scaffolding',
    'בטיחות בפיגום - דרישות והנחיות',
    'פיגום בבנייה חייב להיות בנוי על פי תכניות מתאימות וחייב להיות יציב וחזק. כל פיגום חייב להיות בדוק ביומו בו משתמשים בו. יש להשתמש בחוקי בטיחות מתאימים בעת בנייה והרכבה של פיגום. עובדים חייבים ללבוש חגורת בטיחות בעת עבודה בפיגום בגובה.',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'scaffolding',
    'he',
    NOW(),
    NOW(),
    NOW() + INTERVAL '24 hours',
    false
  ),
  (
    (SELECT id FROM first_source),
    'https://www.gov.il/he/departments/policies/ppe_requirements',
    'ציוד הגנה אישי בבנייה',
    'קסדה בטיחות: כל עובד בשטח בנייה חייב ללבוש קסדת בטיחות מעבר לשקוף הביטחון. הקסדה חייבת להיות בגודל מתאים ובמצב טוב. משקפיים מגנים: שימוש בנימוק בעת עבודה מזיקה הוא חובה. נעליים בטוחות: עובדים חייבים ללבוש נעליים בטוחות עם הגנה על האצבעות.',
    'b8fa7a8afa3f22c21b789d9f3c91e45c2e89e56a4b0b7e7e9d4e8f2c0a5b1c3d',
    'ppe',
    'he',
    NOW(),
    NOW(),
    NOW() + INTERVAL '24 hours',
    false
  ),
  (
    (SELECT id FROM first_source),
    'https://www.osh.org.il/safety/equipment/ladders',
    'בטיחות בשימוש בסולמות',
    'סולמות: סולם חייב להיות יציב ובמצב טוב לפני השימוש בו. יש לבדוק את הסולם לחיזוקים שבורים או חסרים. גובה: במקום שגובהו עד 3 מטרים יש להשתמש בסולם בעל זווית של 75 מעלות. הר הזנב של הסולם חייב להיות קבוע ותיקוע בקרקע.',
    'c7e8e8f8d9f0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f',
    'ladders',
    'he',
    NOW(),
    NOW(),
    NOW() + INTERVAL '24 hours',
    false
  );

-- Add sample embeddings (these are placeholder vectors, in production they would come from the embedding model)
-- Note: These are not real embeddings, just for demo purposes
-- In production, embeddings would be generated using text-embedding-3-small
