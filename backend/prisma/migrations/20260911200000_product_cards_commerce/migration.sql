ALTER TABLE "ProductCard"
  ALTER COLUMN "gameId" DROP NOT NULL,
  ALTER COLUMN "appId" DROP NOT NULL,
  ALTER COLUMN "powerpointId" DROP NOT NULL;

ALTER TABLE "ProductCard"
  ALTER COLUMN "price" TYPE DECIMAL(10, 2)
  USING CASE
    WHEN trim("price") ~ '^[0-9]+([.][0-9]+)?$' THEN trim("price")::DECIMAL(10, 2)
    ELSE 0
  END;

ALTER TABLE "ProductCard"
  ADD COLUMN "originalPrice" DECIMAL(10, 2),
  ADD COLUMN "brand" TEXT,
  ADD COLUMN "category" TEXT,
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 0;

UPDATE "ProductCard"
SET "slug" = 'legacy-product-' || "id"
WHERE "slug" IS NULL;

CREATE UNIQUE INDEX "ProductCard_slug_key" ON "ProductCard" ("slug");
CREATE INDEX "ProductCard_isActive_category_idx" ON "ProductCard" ("isActive", "category");

CREATE TABLE "CartItem" (
  "id" SERIAL PRIMARY KEY,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "userId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CartItem_userId_productId_key" ON "CartItem" ("userId", "productId");
CREATE INDEX "CartItem_userId_idx" ON "CartItem" ("userId");
CREATE INDEX "CartItem_productId_idx" ON "CartItem" ("productId");

CREATE TABLE "WishlistItem" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "WishlistItem_userId_productId_key" ON "WishlistItem" ("userId", "productId");
CREATE INDEX "WishlistItem_userId_idx" ON "WishlistItem" ("userId");
CREATE INDEX "WishlistItem_productId_idx" ON "WishlistItem" ("productId");
