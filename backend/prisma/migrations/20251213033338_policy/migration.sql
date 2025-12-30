-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "chosenPolicyId" TEXT;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_chosenPolicyId_fkey" FOREIGN KEY ("chosenPolicyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
