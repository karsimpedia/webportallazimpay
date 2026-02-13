/*
  Warnings:

  - The values [PPOB_SINGLE] on the enum `MenuType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MenuType_new" AS ENUM ('ELEKTRIK', 'SPESIAL_PLN', 'TRANSFER_BANK', 'PPOB_MULTIPRODUK', 'TRX_PPOB_SINGLE', 'WEBVIEW', 'PRODUKSI_VOUCHER', 'TOPUP_SALDO');
ALTER TABLE "Menu" ALTER COLUMN "jenis" TYPE "MenuType_new" USING ("jenis"::text::"MenuType_new");
ALTER TABLE "FavoriteMenu" ALTER COLUMN "jenis" TYPE "MenuType_new" USING ("jenis"::text::"MenuType_new");
ALTER TYPE "MenuType" RENAME TO "MenuType_old";
ALTER TYPE "MenuType_new" RENAME TO "MenuType";
DROP TYPE "MenuType_old";
COMMIT;
