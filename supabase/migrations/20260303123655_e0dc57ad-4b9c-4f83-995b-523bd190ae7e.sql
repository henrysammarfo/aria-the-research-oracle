
ALTER TABLE public.research_sessions ADD COLUMN share_id TEXT UNIQUE DEFAULT NULL;

CREATE INDEX idx_research_sessions_share_id ON public.research_sessions(share_id) WHERE share_id IS NOT NULL;

CREATE POLICY "Anyone can read shared reports"
  ON public.research_sessions FOR SELECT
  TO anon, authenticated
  USING (share_id IS NOT NULL);
