-- SingHUB founding eight pilot: additive achievement tiers and audience nominations.
-- Public writes are forbidden; server triggers/admin service-role are the only award writers.
-- Run this migration before deploying the associated app routes.
BEGIN;
ALTER TABLE public.singer_achievements
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS award_source text NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='singer_achievements_level_check') THEN
    ALTER TABLE public.singer_achievements ADD CONSTRAINT singer_achievements_level_check CHECK (level BETWEEN 1 AND 2);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.singer_achievement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key text NOT NULL,
  badge_level integer NOT NULL CHECK (badge_level BETWEEN 1 AND 2),
  event_kind text NOT NULL DEFAULT 'unlocked' CHECK (event_kind IN ('unlocked','upgraded')),
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id,badge_key,badge_level)
);
ALTER TABLE public.singer_achievement_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Singer reads own achievement events" ON public.singer_achievement_events;
CREATE POLICY "Singer reads own achievement events" ON public.singer_achievement_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS singer_achievement_events_recent
  ON public.singer_achievement_events(user_id,awarded_at DESC);

ALTER TABLE public.singer_profiles
  ADD COLUMN IF NOT EXISTS nomination_token uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS singer_profiles_nomination_token_unique
  ON public.singer_profiles(nomination_token);

CREATE TABLE IF NOT EXISTS public.achievement_nominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nominator_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key text NOT NULL CHECK (badge_key IN ('sing_along_superstar','cheer_captain')),
  nightlife_date date NOT NULL,
  venue_slug text NOT NULL CHECK (char_length(venue_slug) BETWEEN 2 AND 120),
  reason text NOT NULL DEFAULT '' CHECK (char_length(reason) BETWEEN 10 AND 280),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  CONSTRAINT achievement_nomination_not_self CHECK (recipient_user_id <> nominator_user_id),
  CONSTRAINT achievement_nomination_one_per_night UNIQUE
    (recipient_user_id,nominator_user_id,badge_key,nightlife_date)
);
ALTER TABLE public.achievement_nominations ENABLE ROW LEVEL SECURITY;
-- No public RLS policies: nominations remain admin-only until moderated.
CREATE INDEX IF NOT EXISTS achievement_nominations_pending
  ON public.achievement_nominations(status,created_at DESC);
CREATE INDEX IF NOT EXISTS achievement_nominations_group
  ON public.achievement_nominations(recipient_user_id,badge_key,nightlife_date);

CREATE OR REPLACE FUNCTION public.sync_singer_automatic_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_performances integer;
  v_performance_venues integer;
  v_tour_venues integer;
  v_best_night integer;
  v_item record;
  v_current integer;
BEGIN
  IF p_user_id IS NULL THEN RETURN; END IF;
  SELECT count(*)::int, count(DISTINCT NULLIF(venue_slug,''))::int
    INTO v_performances,v_performance_venues
    FROM public.singer_performances WHERE user_id=p_user_id;
  SELECT count(DISTINCT venue_id)::int INTO v_tour_venues
    FROM public.singer_venue_visits
    WHERE user_id=p_user_id AND status='confirmed';
  SELECT COALESCE(MAX(n),0)::int INTO v_best_night FROM (
    SELECT count(DISTINCT venue_id) AS n FROM public.singer_venue_visits
    WHERE user_id=p_user_id AND status='confirmed' GROUP BY nightlife_date
  ) nights;

  FOR v_item IN
    SELECT * FROM (VALUES
      ('first_gig','First Gig',CASE WHEN v_performances>=1 THEN 1 ELSE 0 END),
      ('building_a_setlist','Building a Setlist',CASE WHEN v_performances>=20 THEN 2 WHEN v_performances>=10 THEN 1 ELSE 0 END),
      ('born_performer','Born Performer',CASE WHEN v_performances>=100 THEN 2 WHEN v_performances>=25 THEN 1 ELSE 0 END),
      ('mic_crawl','Mic Crawl',CASE WHEN v_tour_venues>=10 THEN 2 WHEN v_tour_venues>=5 THEN 1 ELSE 0 END),
      ('mix_it_up','Mix It Up',CASE WHEN v_performance_venues>=7 THEN 2 WHEN v_performance_venues>=3 THEN 1 ELSE 0 END),
      ('the_traveller','The Traveller',CASE WHEN v_best_night>=5 THEN 2 WHEN v_best_night>=3 THEN 1 ELSE 0 END)
    ) AS available(badge_key,badge_name,level)
  LOOP
    IF v_item.level = 0 THEN CONTINUE; END IF;
    SELECT level INTO v_current FROM public.singer_achievements
      WHERE user_id=p_user_id AND badge_key=v_item.badge_key;
    INSERT INTO public.singer_achievements
      (user_id,badge_key,badge_name,level,award_source,award_note,updated_at)
      VALUES (p_user_id,v_item.badge_key,v_item.badge_name,v_item.level,
        'automatic','Based on singer-reported activity; not independently verified.',now())
    ON CONFLICT (user_id,badge_key) DO UPDATE SET
      level = GREATEST(public.singer_achievements.level,EXCLUDED.level),
      updated_at = CASE WHEN public.singer_achievements.level < EXCLUDED.level THEN now()
        ELSE public.singer_achievements.updated_at END;
    IF v_item.level > COALESCE(v_current,0) THEN
      INSERT INTO public.singer_achievement_events
        (user_id,badge_key,badge_level,event_kind)
      VALUES (p_user_id,v_item.badge_key,v_item.level,
        CASE WHEN v_current IS NULL THEN 'unlocked' ELSE 'upgraded' END)
      ON CONFLICT (user_id,badge_key,badge_level) DO NOTHING;
    END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.update_singer_achievements_from_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public.sync_singer_automatic_achievements(
    CASE WHEN TG_OP='DELETE' THEN OLD.user_id ELSE NEW.user_id END);
  RETURN COALESCE(NEW,OLD);
END $$;

DROP TRIGGER IF EXISTS singer_performance_achievement_sync ON public.singer_performances;
CREATE TRIGGER singer_performance_achievement_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.singer_performances
  FOR EACH ROW EXECUTE FUNCTION public.update_singer_achievements_from_activity();
DROP TRIGGER IF EXISTS singer_visit_achievement_sync ON public.singer_venue_visits;
CREATE TRIGGER singer_visit_achievement_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.singer_venue_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_singer_achievements_from_activity();

REVOKE ALL ON FUNCTION public.sync_singer_automatic_achievements(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_singer_achievements_from_activity() FROM PUBLIC, anon, authenticated;

-- Award earned milestones from past logs, rather than demanding new check-ins.
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT DISTINCT user_id FROM public.singer_performances
    UNION SELECT DISTINCT user_id FROM public.singer_venue_visits
  ) LOOP
    PERFORM public.sync_singer_automatic_achievements(r.user_id);
  END LOOP;
END $$;
COMMIT;
