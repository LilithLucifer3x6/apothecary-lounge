ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS moon_phase TEXT,
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
