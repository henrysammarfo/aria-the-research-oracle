
-- Drop the duplicate and recreate to be safe
DROP POLICY IF EXISTS "Anyone can read shared reports" ON public.research_sessions;
CREATE POLICY "Anyone can read shared reports"
  ON public.research_sessions FOR SELECT
  TO anon, authenticated
  USING (share_id IS NOT NULL);
