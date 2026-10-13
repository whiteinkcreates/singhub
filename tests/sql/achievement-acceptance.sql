-- Runs only against tests/sql/achievement-fixture.sql in the disposable CI database.
-- Raise on any unexpected patch, stale level, vote abuse, or partial admin review.
DO $$
DECLARE
  a uuid := '00000000-0000-4000-8000-000000000001';
  b uuid := '00000000-0000-4000-8000-000000000002';
BEGIN
  IF (SELECT count(*) FROM public.singer_achievements) <> 3 THEN
    RAISE EXCEPTION 'Expected exactly 3 backfilled awards.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.singer_achievements WHERE user_id=a AND badge_key='first_gig' AND level=1)
  OR NOT EXISTS (SELECT 1 FROM public.singer_achievements WHERE user_id=a AND badge_key='building_a_setlist' AND level=1)
  OR NOT EXISTS (SELECT 1 FROM public.singer_achievements WHERE user_id=b AND badge_key='mic_crawl' AND level=1)
  THEN RAISE EXCEPTION 'Historical performance and Tour Stop backfill failed.'; END IF;
  IF EXISTS (SELECT 1 FROM public.singer_achievements WHERE badge_key='the_traveller')
  THEN RAISE EXCEPTION 'Lifetime tour count incorrectly triggered same-night Traveller.'; END IF;
  IF (SELECT count(*) FROM public.singer_achievement_events) <> 3 THEN
    RAISE EXCEPTION 'Expected 3 distinct reveal events for initial backfill.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.singer_profiles
    WHERE user_id=a AND nomination_token IS NOT NULL)
  THEN RAISE EXCEPTION 'Singer did not receive personal QR token.'; END IF;
END $$;

-- Performance milestones award automatically and Level II upgrades one patch.
INSERT INTO public.singer_performances(user_id,venue_slug)
SELECT '00000000-0000-4000-8000-000000000001', 'stage-a'
FROM generate_series(1,10);
DO $$
BEGIN
  IF (SELECT level FROM public.singer_achievements
      WHERE user_id='00000000-0000-4000-8000-000000000001'
        AND badge_key='building_a_setlist') <> 2
  THEN RAISE EXCEPTION 'Building a Setlist did not upgrade to Level II.'; END IF;
  IF (SELECT count(*) FROM public.singer_achievement_events
      WHERE badge_key='building_a_setlist') <> 2
  THEN RAISE EXCEPTION 'Expected one unlock and one upgrade event for the same patch.'; END IF;
  IF (SELECT count(*) FROM public.singer_achievements WHERE badge_key='building_a_setlist') <> 1
  THEN RAISE EXCEPTION 'An upgraded patch occupied more than one slot.'; END IF;
END $$;

INSERT INTO public.singer_performances(user_id,venue_slug) VALUES
  ('00000000-0000-4000-8000-000000000001','stage-b'),
  ('00000000-0000-4000-8000-000000000001','stage-c');
INSERT INTO public.singer_performances(user_id,venue_slug)
SELECT '00000000-0000-4000-8000-000000000001','stage-a'
FROM generate_series(1,3);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.singer_achievements
    WHERE badge_key='mix_it_up' AND level=1)
  THEN RAISE EXCEPTION 'Mix It Up failed at 3 distinct performance venues.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.singer_achievements
    WHERE badge_key='born_performer' AND level=1)
  THEN RAISE EXCEPTION 'Born Performer failed at 25 song records.'; END IF;
END $$;

-- Pending visits never count. Confirming 3/5 visits on the SAME saved date
-- awards Traveller I, then Traveller II, while Mic Crawl separately upgrades.
INSERT INTO public.singer_venue_visits
  (user_id,venue_id,venue_slug,nightlife_date,status)
SELECT
  '00000000-0000-4000-8000-000000000002',
  'night-'||n,
  'night-'||n,
  '2026-10-10'::date,
  'pending'
FROM generate_series(1,5) n;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.singer_achievements WHERE badge_key='the_traveller')
  THEN RAISE EXCEPTION 'Pending Tour Stops were incorrectly counted.'; END IF;
END $$;

UPDATE public.singer_venue_visits SET status='confirmed'
WHERE user_id='00000000-0000-4000-8000-000000000002'
  AND venue_id IN ('night-1','night-2','night-3');
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.singer_achievements
    WHERE badge_key='the_traveller' AND level=1)
  THEN RAISE EXCEPTION 'Traveller I failed at 3 same-night confirmed rooms.'; END IF;
END $$;

UPDATE public.singer_venue_visits SET status='confirmed'
WHERE user_id='00000000-0000-4000-8000-000000000002'
  AND venue_id IN ('night-4','night-5');
DO $$
BEGIN
  IF (SELECT level FROM public.singer_achievements
    WHERE badge_key='the_traveller') <> 2
  THEN RAISE EXCEPTION 'Traveller II failed at 5 same-night confirmed rooms.'; END IF;
  IF (SELECT level FROM public.singer_achievements
    WHERE badge_key='mic_crawl') <> 2
  THEN RAISE EXCEPTION 'Mic Crawl II failed at 10 lifetime distinct rooms.'; END IF;
  IF (SELECT count(*) FROM public.singer_achievement_events WHERE badge_key='the_traveller') <> 2
  THEN RAISE EXCEPTION 'Traveller unlock and level-up event count is wrong.'; END IF;
END $$;

-- Nominations must be independent, witnessed claims, and atomic on review.
INSERT INTO public.achievement_nominations
  (recipient_user_id,nominator_user_id,badge_key,nightlife_date,venue_slug,reason)
VALUES
  ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002',
   'sing_along_superstar','2026-10-10','stage-a','The room joined the final chorus.'),
  ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003',
   'sing_along_superstar','2026-10-10','stage-a','Everybody sang together.');

DO $$
DECLARE v_blocked boolean:=false;
BEGIN
  BEGIN
    PERFORM * FROM public.review_singer_achievement_nominations(
      '00000000-0000-4000-8000-000000000001','sing_along_superstar','2026-10-10','stage-a','approve');
  EXCEPTION WHEN OTHERS THEN
    IF position('three independent' in lower(SQLERRM)) > 0 THEN v_blocked:=true;
    ELSE RAISE; END IF;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'Under-quorum approval was allowed.'; END IF;
  IF EXISTS (SELECT 1 FROM public.singer_achievements WHERE badge_key='sing_along_superstar')
  OR EXISTS (SELECT 1 FROM public.achievement_nominations WHERE status<>'pending')
  THEN RAISE EXCEPTION 'A failed approval partially modified data.'; END IF;
END $$;

INSERT INTO public.achievement_nominations
  (recipient_user_id,nominator_user_id,badge_key,nightlife_date,venue_slug,reason)
VALUES
  ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000004',
   'sing_along_superstar','2026-10-10','stage-a','Sang with the whole crowd.');

SELECT * FROM public.review_singer_achievement_nominations(
  '00000000-0000-4000-8000-000000000001','sing_along_superstar','2026-10-10','stage-a','approve');

DO $$
DECLARE v_rejected boolean:=false;
BEGIN
  IF (SELECT count(*) FROM public.achievement_nominations WHERE status='approved') <> 3
    OR (SELECT count(*) FROM public.singer_achievements WHERE badge_key='sing_along_superstar') <> 1
    OR (SELECT count(*) FROM public.singer_achievement_events WHERE badge_key='sing_along_superstar') <> 1
  THEN RAISE EXCEPTION 'Approval should commit exactly one patch, one reveal, and three approved nominations.'; END IF;
  BEGIN
    PERFORM * FROM public.review_singer_achievement_nominations(
      '00000000-0000-4000-8000-000000000001','sing_along_superstar','2026-10-10','stage-a','approve');
  EXCEPTION WHEN OTHERS THEN
    IF position('No pending' in SQLERRM) > 0 THEN v_rejected:=true;
    ELSE RAISE; END IF;
  END;
  IF NOT v_rejected THEN RAISE EXCEPTION 'Duplicate community approval was allowed.'; END IF;
END $$;

INSERT INTO public.achievement_nominations
  (recipient_user_id,nominator_user_id,badge_key,nightlife_date,venue_slug,reason)
VALUES
  ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002',
   'cheer_captain','2026-10-10','stage-a','Cheered for every new singer.');
SELECT * FROM public.review_singer_achievement_nominations(
  '00000000-0000-4000-8000-000000000001','cheer_captain','2026-10-10','stage-a','reject');

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.singer_achievements WHERE badge_key='cheer_captain')
  THEN RAISE EXCEPTION 'Rejecting a nomination should not award Cheer Captain.'; END IF;
  IF (SELECT count(*) FROM public.achievement_nominations WHERE status='rejected') <> 1
  THEN RAISE EXCEPTION 'A nomination rejection was not saved.'; END IF;
  IF has_function_privilege('authenticated',
      'public.review_singer_achievement_nominations(uuid,text,date,text,text)','EXECUTE')
  THEN RAISE EXCEPTION 'Normal singers can execute admin nomination reviews.'; END IF;
  IF NOT has_function_privilege('service_role',
      'public.review_singer_achievement_nominations(uuid,text,date,text,text)','EXECUTE')
  THEN RAISE EXCEPTION 'Server service role lacks review permission.'; END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='achievement_nominations') <> 0
  THEN RAISE EXCEPTION 'Nominations must have no public read policy.'; END IF;
END $$;

-- RLS: a signed-in singer may read their own achievements/reveals, never another singer's.
SET ROLE authenticated;
SET request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
DO $$
BEGIN
  IF (SELECT count(*) FROM public.singer_achievement_events) < 1 THEN
    RAISE EXCEPTION 'Signed-in singer cannot read their own award events.'; END IF;
  IF EXISTS (SELECT 1 FROM public.singer_achievement_events
    WHERE user_id='00000000-0000-4000-8000-000000000002') THEN
    RAISE EXCEPTION 'Signed-in singer can read someone else''s award events.'; END IF;
END $$;
RESET ROLE;
RESET request.jwt.claim.sub;
SELECT 'PASS: Founding Eight database migration, backfill, levels, quorum, atomic reviews and RLS' AS test_result;
