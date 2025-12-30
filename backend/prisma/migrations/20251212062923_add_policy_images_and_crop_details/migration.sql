-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "cropDetails" JSONB,
ADD COLUMN     "policyImages" JSONB;

-- AlterTable
ALTER TABLE "PolicyRequest" ADD COLUMN     "cropDetails" JSONB,
ADD COLUMN     "farmImages" JSONB;
