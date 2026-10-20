-- Verified venue/KJ contributor identities and reviewable self-posts.
-- Additive: legacy access-code posters continue working until account linkage is approved.
ALTER TABLE public.singboard_posters
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;
CREATE INDEX IF NOT EXISTS singboard_posters_verified_user
  ON public.singboard_posters(user_id) WHERE active AND user_id IS NOT NULL;
ALTER TABLE public.singboard_flyers
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'special',
  ADD COLUMN IF NOT EXISTS venue_id text,
  ADD COLUMN IF NOT EXISTS host_id text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;
DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='singboard_flyer_category_check') THEN
  ALTER TABLE public.singboard_flyers ADD CONSTRAINT singboard_flyer_category_check
    CHECK (category IN ('special','theme_karaoke','hiring','community','live_music'));
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='singboard_flyer_verification_check') THEN
  ALTER TABLE public.singboard_flyers ADD CONSTRAINT singboard_flyer_verification_check
    CHECK (verification_status IN ('pending','verified','rejected'));
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS singboard_flyers_venue_posts
 ON public.singboard_flyers(venue_id,event_date DESC) WHERE status='active';
CREATE INDEX IF NOT EXISTS singboard_flyers_host_posts
 ON public.singboard_flyers(host_id,event_date DESC) WHERE status='active';
CREATE INDEX IF NOT EXISTS singboard_flyers_review_queue
 ON public.singboard_flyers(verification_status,created_at DESC) WHERE status='active';
-- No direct authenticated writes: all posting/admin mutations use authorization-gated server routes.
ALTER TABLE public.singboard_flyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.singboard_posters ENABLE ROW LEVEL SECURITY;
