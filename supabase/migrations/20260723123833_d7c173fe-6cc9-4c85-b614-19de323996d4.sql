
-- Restrict column access on quiz_questions so authenticated staff cannot read the answer key.
REVOKE SELECT ON public.quiz_questions FROM authenticated;
GRANT SELECT (id, module_id, question_order, question_text, option_a, option_b, option_c, option_d)
  ON public.quiz_questions TO authenticated;

-- Server-side answer checker. Returns correctness + explanation without exposing correct_option in queries.
CREATE OR REPLACE FUNCTION public.check_quiz_answer(_question_id uuid, _choice text)
RETURNS TABLE(correct boolean, correct_option text, explanation text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _choice IS NULL OR _choice NOT IN ('a','b','c','d') THEN
    RAISE EXCEPTION 'Invalid choice';
  END IF;

  RETURN QUERY
  SELECT (q.correct_option = _choice) AS correct,
         q.correct_option,
         q.explanation
  FROM public.quiz_questions q
  WHERE q.id = _question_id;
END;
$$;

REVOKE ALL ON FUNCTION public.check_quiz_answer(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.check_quiz_answer(uuid, text) TO authenticated;
