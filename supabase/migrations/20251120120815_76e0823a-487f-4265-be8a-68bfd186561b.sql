-- Create folders table to store custom folder names
CREATE TABLE public.folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled Folder',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching stickers table)
CREATE POLICY "Anyone can view folders" 
ON public.folders 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create folders" 
ON public.folders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update folders" 
ON public.folders 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();