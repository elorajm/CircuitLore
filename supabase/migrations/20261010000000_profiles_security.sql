BEGIN;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Student'
    CHECK (char_length(btrim(display_name)) BETWEEN 1 AND 80),
  role text NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'adult')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT UPDATE (display_name) ON TABLE public.profiles TO authenticated;

CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.set_profile_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.set_profile_updated_at() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_updated_at();

CREATE OR REPLACE FUNCTION public.prevent_untrusted_profile_identity_changes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF current_user NOT IN ('postgres', 'service_role')
     AND (NEW.id IS DISTINCT FROM OLD.id
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.created_at IS DISTINCT FROM OLD.created_at) THEN
    RAISE EXCEPTION 'Profile identity and role fields cannot be changed by this user'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.prevent_untrusted_profile_identity_changes() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER profiles_protect_identity_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_untrusted_profile_identity_changes();

CREATE OR REPLACE FUNCTION public.create_profile_for_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  candidate_name text;
BEGIN
  candidate_name := btrim(COALESCE(NEW.raw_user_meta_data ->> 'display_name', ''));

  IF char_length(candidate_name) NOT BETWEEN 1 AND 80 THEN
    candidate_name := 'Student';
  END IF;

  INSERT INTO public.profiles (id, display_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    candidate_name,
    'student',
    COALESCE(NEW.created_at, now()),
    COALESCE(NEW.created_at, now())
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_profile_for_auth_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_auth_user();

INSERT INTO public.profiles (id, display_name, role, created_at, updated_at)
SELECT
  u.id,
  CASE
    WHEN char_length(btrim(COALESCE(u.raw_user_meta_data ->> 'display_name', ''))) BETWEEN 1 AND 80
      THEN btrim(u.raw_user_meta_data ->> 'display_name')
    ELSE 'Student'
  END,
  'student',
  COALESCE(u.created_at, now()),
  COALESCE(u.created_at, now())
FROM auth.users AS u
ON CONFLICT (id) DO NOTHING;

COMMIT;
