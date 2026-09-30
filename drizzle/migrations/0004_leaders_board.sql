CREATE TABLE public.leader_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_email text NOT NULL,
  tool text NOT NULL CHECK (tool IN ('teams','forms','canva','edpuzzle','copilot','immersive')),
  padlet_url text,
  declared_at timestamptz NOT NULL DEFAULT now(),
  approved boolean NOT NULL DEFAULT true,
  approved_by text,
  UNIQUE (staff_email, tool)
);
GRANT SELECT, INSERT, UPDATE ON public.leader_shares TO authenticated;
GRANT ALL ON public.leader_shares TO service_role;
ALTER TABLE public.leader_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own or admin read shares" ON public.leader_shares FOR SELECT TO authenticated
  USING (lower(staff_email) = lower(auth.jwt()->>'email') OR public.is_admin());
CREATE POLICY "Own or admin insert shares" ON public.leader_shares FOR INSERT TO authenticated
  WITH CHECK ((lower(staff_email) = lower(auth.jwt()->>'email') AND approved = true) OR public.is_admin());
CREATE POLICY "Own or admin update shares" ON public.leader_shares FOR UPDATE TO authenticated
  USING (lower(staff_email) = lower(auth.jwt()->>'email') OR public.is_admin())
  WITH CHECK (public.is_admin() OR (lower(staff_email) = lower(auth.jwt()->>'email')));

CREATE OR REPLACE FUNCTION public.leader_shares_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.approved := OLD.approved;
    NEW.approved_by := OLD.approved_by;
    NEW.staff_email := OLD.staff_email;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER leader_shares_guard_trg BEFORE UPDATE ON public.leader_shares
  FOR EACH ROW EXECUTE FUNCTION public.leader_shares_guard();

CREATE OR REPLACE FUNCTION public.approved_share_count(_email text) RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(DISTINCT tool)::int FROM public.leader_shares
  WHERE lower(staff_email) = lower(_email) AND approved = true
$$;

CREATE TABLE public.leader_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_email text NOT NULL UNIQUE,
  name text NOT NULL,
  department text,
  tool text NOT NULL CHECK (tool IN ('teams','forms','canva','edpuzzle','copilot','immersive')),
  intent text NOT NULL CHECK (char_length(intent) <= 140),
  implementation text NOT NULL CHECK (char_length(implementation) <= 140),
  impact text NOT NULL CHECK (char_length(impact) <= 140),
  audiences text[] NOT NULL DEFAULT '{}',
  photo_url text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.leader_cards TO authenticated;
GRANT ALL ON public.leader_cards TO service_role;
ALTER TABLE public.leader_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read published or own cards" ON public.leader_cards FOR SELECT TO authenticated
  USING (published = true OR lower(staff_email) = lower(auth.jwt()->>'email') OR public.is_admin());
CREATE POLICY "Leaders with six shares create own card" ON public.leader_cards FOR INSERT TO authenticated
  WITH CHECK (lower(staff_email) = lower(auth.jwt()->>'email') AND public.approved_share_count(staff_email) >= 6);
CREATE POLICY "Own or admin update card" ON public.leader_cards FOR UPDATE TO authenticated
  USING (lower(staff_email) = lower(auth.jwt()->>'email') OR public.is_admin())
  WITH CHECK (lower(staff_email) = lower(auth.jwt()->>'email') OR public.is_admin());

CREATE TABLE public.leader_card_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.leader_cards(id) ON DELETE CASCADE,
  staff_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (card_id, staff_email)
);
GRANT SELECT, INSERT, DELETE ON public.leader_card_reactions TO authenticated;
GRANT ALL ON public.leader_card_reactions TO service_role;
ALTER TABLE public.leader_card_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in read reactions" ON public.leader_card_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own reaction insert" ON public.leader_card_reactions FOR INSERT TO authenticated
  WITH CHECK (lower(staff_email) = lower(auth.jwt()->>'email'));
CREATE POLICY "Own reaction delete" ON public.leader_card_reactions FOR DELETE TO authenticated
  USING (lower(staff_email) = lower(auth.jwt()->>'email'));

CREATE POLICY "Leader photos signed-in read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'leader-photos');
CREATE POLICY "Leader photos own upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'leader-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Leader photos own update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'leader-photos' AND (storage.foldername(name))[1] = auth.uid()::text);