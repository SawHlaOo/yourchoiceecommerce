-- Allow one product card to appear in multiple catalog categories.
ALTER TABLE "ProductCard"
  ADD COLUMN "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "ProductCard"
SET "categories" = ARRAY["category"]::TEXT[]
WHERE "category" IS NOT NULL AND btrim("category") <> '';

DROP INDEX IF EXISTS "ProductCard_isActive_category_idx";
ALTER TABLE "ProductCard" DROP COLUMN "category";

CREATE INDEX "ProductCard_isActive_categories_idx"
  ON "ProductCard" ("isActive");
