
-- Fix: restrict anonymous donations to only allow setting user_id to null or own id
DROP POLICY "Anyone can create donaciones" ON public.donaciones;

CREATE POLICY "Anyone can create donaciones" ON public.donaciones
  FOR INSERT WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );
