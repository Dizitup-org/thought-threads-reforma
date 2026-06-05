-- Add parent_id to collections for sub-collection hierarchy
ALTER TABLE "collections"
  ADD COLUMN IF NOT EXISTS "parent_id" UUID
  REFERENCES "collections"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "idx_collections_parent_id"
  ON "collections"("parent_id");
