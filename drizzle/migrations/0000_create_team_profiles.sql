CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (length(trim(display_name)) BETWEEN 2 AND 100),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE(display_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profile_owner_read ON public.profiles FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY profile_owner_update ON public.profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
CREATE FUNCTION public.create_team_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE candidate text;
BEGIN
  candidate := trim(coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', ''));
  IF length(candidate) NOT BETWEEN 2 AND 100 THEN candidate := 'Membro da equipe'; END IF;
  INSERT INTO public.profiles(id, display_name) VALUES(new.id, candidate) ON CONFLICT(id) DO NOTHING;
  RETURN new;
END;
$$;
REVOKE ALL ON FUNCTION public.create_team_profile() FROM public, anon, authenticated;
CREATE TRIGGER leadtrace_profile_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_team_profile();