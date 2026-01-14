-- Add DELETE policy for folders table
CREATE POLICY "Anyone can delete folders" 
ON public.folders 
FOR DELETE 
USING (true);