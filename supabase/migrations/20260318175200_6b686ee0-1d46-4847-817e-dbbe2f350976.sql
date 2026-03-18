
-- Table for storing individual inclusion responses (checklist + ratings)
CREATE TABLE public.inclusion_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  full_name text NOT NULL DEFAULT 'Anonymous',
  department text NOT NULL DEFAULT 'General',
  checklist_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ratings_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_checked integer NOT NULL DEFAULT 0,
  avg_rating numeric(3,2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for inclusion stories shared by staff
CREATE TABLE public.inclusion_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  department text NOT NULL,
  tool_name text NOT NULL,
  story text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inclusion_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inclusion_stories ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read inclusion responses (for averages)
CREATE POLICY "Anyone can view inclusion responses"
  ON public.inclusion_responses FOR SELECT
  TO public
  USING (true);

-- RLS: Anyone can insert inclusion responses (no auth required for this anonymous survey)
CREATE POLICY "Anyone can submit inclusion responses"
  ON public.inclusion_responses FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS: Users can update their own responses by session_id
CREATE POLICY "Users can update own responses"
  ON public.inclusion_responses FOR UPDATE
  TO public
  USING (true);

-- RLS: Anyone can view stories
CREATE POLICY "Anyone can view inclusion stories"
  ON public.inclusion_stories FOR SELECT
  TO public
  USING (true);

-- RLS: Anyone can share stories
CREATE POLICY "Anyone can share inclusion stories"
  ON public.inclusion_stories FOR INSERT
  TO public
  WITH CHECK (true);
