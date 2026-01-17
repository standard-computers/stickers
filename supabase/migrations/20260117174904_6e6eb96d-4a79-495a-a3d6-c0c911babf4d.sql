-- Add dark_mode column to folders table
ALTER TABLE public.folders ADD COLUMN dark_mode boolean NOT NULL DEFAULT false;