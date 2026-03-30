-- ⚠️  DEV/STAGING ONLY — DO NOT run this migration in production.
-- This file removes all registered users as a one-time database reset.
-- Rows in public.profiles and public.subscriptions are deleted automatically
-- via the ON DELETE CASCADE constraints defined in the initial migration.
DELETE FROM auth.users;
