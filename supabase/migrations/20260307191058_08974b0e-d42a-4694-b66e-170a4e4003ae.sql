
DROP POLICY IF EXISTS "Anyone can read shared reports" ON public.research_sessions;
DROP POLICY IF EXISTS "Users can read own sessions" ON public.research_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.research_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.research_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.research_sessions;

CREATE POLICY "Users can read own sessions"
ON public.research_sessions FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Anyone can read shared reports"
ON public.research_sessions FOR SELECT TO anon, authenticated
USING (share_id IS NOT NULL);

CREATE POLICY "Users can insert own sessions"
ON public.research_sessions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
ON public.research_sessions FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
ON public.research_sessions FOR DELETE TO authenticated
USING (user_id = auth.uid());
