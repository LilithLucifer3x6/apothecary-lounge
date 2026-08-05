CREATE TABLE IF NOT EXISTS public.shadowtome_elixirs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand text,
  name text NOT NULL,
  ingredients jsonb,
  caffeine_content text,
  steep_time text,
  circadian_alignment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


