-- Migration: Create Wearable Snapshots Table
-- This table stores snapshots of wearable data retrieved by the Android app.
-- The web app reads from this table instead of contacting a broker directly.

CREATE TABLE IF NOT EXISTS wearable_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    readiness_score INT NOT NULL,
    readiness_state TEXT NOT NULL,
    heavy_sweat BOOLEAN NOT NULL,
    sleep_duration NUMERIC NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE wearable_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow read access
DROP POLICY IF EXISTS "Allow read access to all users" ON wearable_snapshots;
CREATE POLICY "Allow read access to all users" 
ON wearable_snapshots FOR SELECT 
USING (true);

-- Allow insert access
DROP POLICY IF EXISTS "Allow insert access to all users" ON wearable_snapshots;
CREATE POLICY "Allow insert access to all users" 
ON wearable_snapshots FOR INSERT 
WITH CHECK (true);
