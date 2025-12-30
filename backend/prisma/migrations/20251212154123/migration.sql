/*
  Warnings:

  - You are about to drop the column `isExternalInsurer` on the `ServiceProvider` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PolicyRequest" DROP CONSTRAINT "PolicyRequest_serviceProviderId_fkey";

-- AlterTable
ALTER TABLE "PolicyRequest" ALTER COLUMN "serviceProviderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ServiceProvider" DROP COLUMN "isExternalInsurer";

-- AddForeignKey
ALTER TABLE "PolicyRequest" ADD CONSTRAINT "PolicyRequest_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "ServiceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
