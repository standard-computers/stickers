-- Add color_index column to stickers table
ALTER TABLE public.stickers 
ADD COLUMN color_index integer NOT NULL DEFAULT 0;

-- Add UPDATE policy for stickers table
CREATE POLICY "Anyone can update stickers" 
ON public.stickers 
FOR UPDATE 
USING (true);