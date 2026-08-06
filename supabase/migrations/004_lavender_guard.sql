-- Migration: Enforce permanent Lavender block in Codex
-- This trigger ensures that Lavender cannot be removed or altered via any UI action or API call.

CREATE OR REPLACE FUNCTION guard_lavender_codex_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.ingredient ILIKE '%lavender%' OR 
       OLD.ingredient ILIKE '%lavandula%' OR 
       OLD.ingredient ILIKE '%lavandin%' THEN
        RAISE EXCEPTION 'Safety Violation: Lavender is permanently sealed in the Codex and cannot be removed.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION guard_lavender_codex_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If the old value was Lavender, but the new value is NOT Lavender, block it.
    IF (OLD.ingredient ILIKE '%lavender%' OR 
        OLD.ingredient ILIKE '%lavandula%' OR 
        OLD.ingredient ILIKE '%lavandin%') 
       AND NOT 
       (NEW.ingredient ILIKE '%lavender%' OR 
        NEW.ingredient ILIKE '%lavandula%' OR 
        NEW.ingredient ILIKE '%lavandin%') THEN
        RAISE EXCEPTION 'Safety Violation: Lavender is permanently sealed in the Codex and cannot be renamed to bypass the lock.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Prevent deletion
DROP TRIGGER IF EXISTS enforce_lavender_guard_delete ON codex_entries;
CREATE TRIGGER enforce_lavender_guard_delete
BEFORE DELETE ON codex_entries
FOR EACH ROW
EXECUTE FUNCTION guard_lavender_codex_delete();

-- Prevent renaming out of Lavender
DROP TRIGGER IF EXISTS enforce_lavender_guard_update ON codex_entries;
CREATE TRIGGER enforce_lavender_guard_update
BEFORE UPDATE ON codex_entries
FOR EACH ROW
EXECUTE FUNCTION guard_lavender_codex_update();
