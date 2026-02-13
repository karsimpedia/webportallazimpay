-- DropForeignKey
ALTER TABLE "FavoriteMenuOperator" DROP CONSTRAINT "FavoriteMenuOperator_favoriteMenuId_fkey";

-- AddForeignKey
ALTER TABLE "FavoriteMenuOperator" ADD CONSTRAINT "FavoriteMenuOperator_favoriteMenuId_fkey" FOREIGN KEY ("favoriteMenuId") REFERENCES "FavoriteMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
