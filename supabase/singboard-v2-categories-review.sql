-- SingBOARD: self-publishing category and after-publication review metadata.
-- Additive only. Must be applied before the companion application PR is merged.
-- This does not alter who can write: publishing remains server-authenticated to an approved poster.
ALTER TABLE public.singboard_flyers
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'special_event',
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS venue_slug text,
  ADD COLUMN IF NOT EXISTS host_id text;
DO $constraints$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'singboard_flyers_category_check') THEN
    ALTER TABLE public.singboard_flyers ADD CONSTRAINT singboard_flyers_category_check
      CHECK (category IN ('special_event','theme_karaoke','hiring','community','notice'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'singboard_flyers_review_status_check') THEN
    ALTER TABLE public.singboard_flyers ADD CONSTRAINT singboard_flyers_review_status_check
      CHECK (review_status IN ('pending','verified'));
  END IF;
END $constraints$;

-- A wanted poster is hiring even when it predates explicit category support.
UPDATE public.singboard_flyers
SET category = 'hiring'
WHERE post_type = 'wanted' AND category = 'special_event';

CREATE INDEX IF NOT EXISTS singboard_flyers_review_queue
  ON public.singboard_flyers (review_status, status, created_at DESC);
CREATE INDEX IF NOT EXISTS singboard_flyers_venue_slug
  ON public.singboard_flyers (venue_slug, status, event_date);
CREATE INDEX IF NOT EXISTS singboard_flyers_host_id
  ON public.singboard_flyers (host_id, status, event_date);

-- Preserve existing RLS and backend-only permissions. Publicly readable posts
-- continue to be exposed through the existing server route, not a client SQL write.
