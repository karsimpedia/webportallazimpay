-- DropForeignKey
ALTER TABLE "FavoriteMenuOperator" DROP CONSTRAINT "FavoriteMenuOperator_operatorId_fkey";

-- AlterTable
ALTER TABLE "FavoriteMenu" ADD COLUMN     "kodeProduk" TEXT,
ADD COLUMN     "url" TEXT;

-- AddForeignKey
ALTER TABLE "FavoriteMenuOperator" ADD CONSTRAINT "FavoriteMenuOperator_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
