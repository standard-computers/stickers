-- Create stickers table to store text snippets organized by folder_id
CREATE TABLE IF NOT EXISTS public.stickers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (no authentication required)
-- Anyone can view stickers
CREATE POLICY "Anyone can view stickers"
  ON public.stickers FOR SELECT
  USING (true);

-- Anyone can create stickers
CREATE POLICY "Anyone can create stickers"
  ON public.stickers FOR INSERT
  WITH CHECK (true);

-- Anyone can delete stickers
CREATE POLICY "Anyone can delete stickers"
  ON public.stickers FOR DELETE
  USING (true);

-- Create index on folder_id for faster queries
CREATE INDEX idx_stickers_folder_id ON public.stickers(folder_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.stickers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();