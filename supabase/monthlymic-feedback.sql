-- MonthlyMic private feedback. Applied to the active SingHUB Supabase project on 2026-11-18.
-- Private admin-only information, including anonymous notes.
CREATE TABLE IF NOT EXISTS public.monthlymic_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  message text NOT NULL CHECK (char_length(btrim(message)) BETWEEN 10 AND 2000),
  anonymous boolean NOT NULL DEFAULT true,
  display_name text,
  reply_email text,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT monthlymic_feedback_identity_valid CHECK (
    (anonymous AND display_name IS NULL AND reply_email IS NULL)
    OR (NOT anonymous AND display_name IS NOT NULL AND char_length(btrim(display_name)) BETWEEN 2 AND 100)
  )
);
CREATE INDEX IF NOT EXISTS monthlymic_feedback_event_recent_idx
  ON public.monthlymic_feedback (event_id,created_at DESC);
CREATE INDEX IF NOT EXISTS monthlymic_feedback_anti_spam_idx
  ON public.monthlymic_feedback (ip_hash,created_at DESC);

ALTER TABLE public.monthlymic_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.monthlymic_feedback FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.monthlymic_feedback TO service_role;

COMMENT ON TABLE public.monthlymic_feedback IS
  'Private attendee messages to SingHUB, including anonymous submissions, readable only through authenticated admin routes.';
