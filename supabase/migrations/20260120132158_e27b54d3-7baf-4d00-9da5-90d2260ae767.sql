-- Add last_accessed column to folders table
ALTER TABLE public.folders 
ADD COLUMN last_accessed timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now());

-- Update existing folders to use updated_at as their last_accessed value
UPDATE public.folders SET last_accessed = updated_at;

-- Create a function to auto-delete folders not accessed in 6 months
CREATE OR REPLACE FUNCTION public.delete_stale_folders()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- First delete all stickers belonging to stale folders
  DELETE FROM public.stickers 
  WHERE folder_id IN (
    SELECT id FROM public.folders 
    WHERE last_accessed < NOW() - INTERVAL '6 months'
  );
  
  -- Then delete the stale folders
  DELETE FROM public.folders 
  WHERE last_accessed < NOW() - INTERVAL '6 months';
END;
$$;