/*
  Warnings:

  - Made the column `serviceProviderId` on table `PolicyRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PolicyRequest" DROP CONSTRAINT "PolicyRequest_serviceProviderId_fkey";

-- AlterTable
ALTER TABLE "PolicyRequest" ALTER COLUMN "serviceProviderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "isExternalInsurer" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "PolicyRequest" ADD CONSTRAINT "PolicyRequest_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
