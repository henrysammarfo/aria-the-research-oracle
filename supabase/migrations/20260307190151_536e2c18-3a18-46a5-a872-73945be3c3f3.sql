
-- Fix: Both SELECT policies were RESTRICTIVE, meaning they AND'd together.
-- A session needed BOTH share_id IS NOT NULL AND user_id = auth.uid() to be visible.
-- Drop and recreate as PERMISSIVE so they OR together.

DROP POLICY IF EXISTS "Anyone can read shared reports" ON public.research_sessions;
DROP POLICY IF EXISTS "Users can read own sessions" ON public.research_sessions;

CREATE POLICY "Users can read own sessions"
ON public.research_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Anyone can read shared reports"
ON public.research_sessions
FOR SELECT
TO anon, authenticated
USING (share_id IS NOT NULL);
