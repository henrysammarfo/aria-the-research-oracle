CREATE TABLE public.research_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  query TEXT NOT NULL,
  report_title TEXT,
  report_markdown TEXT,
  report_sources JSONB DEFAULT '[]'::jsonb,
  events_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Public access (no auth required) - scoped by device_id
ALTER TABLE public.research_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert sessions"
  ON public.research_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read sessions by device_id"
  ON public.research_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete their own sessions"
  ON public.research_sessions FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_research_sessions_device_id ON public.research_sessions(device_id);
CREATE INDEX idx_research_sessions_created_at ON public.research_sessions(created_at DESC);