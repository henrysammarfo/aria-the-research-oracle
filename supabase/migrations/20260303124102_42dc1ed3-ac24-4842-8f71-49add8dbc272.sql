
CREATE POLICY "Anyone can update own device sessions"
  ON public.research_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
