
-- Create comments table for evidence
CREATE TABLE public.evidence_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evidence_id UUID NOT NULL REFERENCES public.leader_evidence(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'comment',
  message TEXT NOT NULL,
  evidence_id UUID REFERENCES public.leader_evidence(id) ON DELETE CASCADE,
  from_user_name TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evidence_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Comments policies - anyone can view, authenticated can add
CREATE POLICY "Anyone can view comments"
ON public.evidence_comments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add comments"
ON public.evidence_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.evidence_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Notifications policies - users can only see their own
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.evidence_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
