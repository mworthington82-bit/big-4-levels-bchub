-- Big 4: leader cards no longer take photos (3 November 2026). Safe to run twice.
-- 1. How many cards have a photo?
SELECT count(*) AS cards_with_photo FROM public.leader_cards WHERE photo_url IS NOT NULL;
-- 2. Forget them, so every card shows initials.
UPDATE public.leader_cards SET photo_url = NULL WHERE photo_url IS NOT NULL;
-- 3. Then delete the files themselves in the dashboard: Storage -> leader-photos -> select all -> Delete
--    (deleting through the dashboard removes the stored files; deleting rows in SQL does not).
