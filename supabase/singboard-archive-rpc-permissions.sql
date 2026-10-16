-- Restrict an older SECURITY DEFINER archive RPC used by the SingBOARD backend.
-- Public callers must not be allowed to trigger archival of venue/KJ posts.
-- Server/service-role automation remains authorized. No post rows are changed.
REVOKE EXECUTE ON FUNCTION public.singboard_archive_expired() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.singboard_archive_expired() TO service_role;
