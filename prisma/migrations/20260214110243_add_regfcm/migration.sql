-- CreateTable
CREATE TABLE "FcmDevice" (
    "id" SERIAL NOT NULL,
    "appid" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "regtoken" TEXT NOT NULL,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FcmDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FcmDevice_appid_deviceId_key" ON "FcmDevice"("appid", "deviceId");
