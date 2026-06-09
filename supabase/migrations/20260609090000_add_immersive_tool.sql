ALTER TABLE public.training_bookings DROP CONSTRAINT IF EXISTS training_bookings_tool_check;
ALTER TABLE public.training_bookings ADD CONSTRAINT training_bookings_tool_check
  CHECK (tool IN ('teams','forms','canva','edpuzzle','copilot','inclusion','immersive'));
