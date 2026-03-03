
ALTER TABLE public.profiles
  ADD COLUMN theme_preference text DEFAULT 'dark'
  CHECK (theme_preference IN ('dark', 'light'));
