
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.research_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL DEFAULT '',
  message_type text NOT NULL DEFAULT 'text',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
ON public.chat_messages FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own messages"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at);
