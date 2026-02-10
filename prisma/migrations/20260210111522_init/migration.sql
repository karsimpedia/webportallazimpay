-- CreateEnum
CREATE TYPE "DepositCategory" AS ENUM ('BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'UNIQUE_TRANSFER', 'EWALLET', 'RETAIL', 'QRIS');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('OPEN', 'CLOSE');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('MANUAL', 'LINKQU', 'NICEPAY', 'DUITKU', 'OY');

-- CreateEnum
CREATE TYPE "MenuType" AS ENUM ('ELEKTRIK', 'SPESIAL_PLN', 'PPOB_MULTIPRODUK', 'PPOB_SINGLE', 'TRANSFER_BANK', 'PRODUKSI_VOUCHER', 'WEBVIEW', 'TOPUP_SALDO');

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "jenis" "MenuType" NOT NULL,
    "img" TEXT,
    "icon" TEXT NOT NULL,
    "filter" BOOLEAN NOT NULL DEFAULT false,
    "openDenom" BOOLEAN NOT NULL DEFAULT false,
    "kodeProduk" TEXT,
    "url" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuOperator" (
    "menuId" INTEGER NOT NULL,
    "operatorId" INTEGER NOT NULL,

    CONSTRAINT "MenuOperator_pkey" PRIMARY KEY ("menuId","operatorId")
);

-- CreateTable
CREATE TABLE "FavoriteMenu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "jenis" "MenuType" NOT NULL,
    "img" TEXT,
    "icon" TEXT NOT NULL,
    "filter" BOOLEAN NOT NULL DEFAULT false,
    "openDenom" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteMenuOperator" (
    "favoriteMenuId" INTEGER NOT NULL,
    "operatorId" INTEGER NOT NULL,

    CONSTRAINT "FavoriteMenuOperator_pkey" PRIMARY KEY ("favoriteMenuId","operatorId")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunningText" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RunningText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactApk" (
    "id" SERIAL NOT NULL,
    "whatsapp" TEXT,
    "telegram" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactApk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositMethod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "DepositCategory" NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepositMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositBank" (
    "id" SERIAL NOT NULL,
    "methodId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "status" "DepositStatus" NOT NULL DEFAULT 'OPEN',
    "instruction" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepositBank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Operator_code_key" ON "Operator"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DepositMethod_code_key" ON "DepositMethod"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DepositBank_methodId_bankCode_key" ON "DepositBank"("methodId", "bankCode");

-- AddForeignKey
ALTER TABLE "MenuOperator" ADD CONSTRAINT "MenuOperator_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuOperator" ADD CONSTRAINT "MenuOperator_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteMenuOperator" ADD CONSTRAINT "FavoriteMenuOperator_favoriteMenuId_fkey" FOREIGN KEY ("favoriteMenuId") REFERENCES "FavoriteMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteMenuOperator" ADD CONSTRAINT "FavoriteMenuOperator_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositBank" ADD CONSTRAINT "DepositBank_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "DepositMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
