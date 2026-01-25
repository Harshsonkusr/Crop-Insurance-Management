-- AlterTable
ALTER TABLE "FarmDetails" ADD COLUMN     "aadhaarCard" TEXT,
ADD COLUMN     "bankPassbook" TEXT,
ADD COLUMN     "boundaryCoordinates" JSONB,
ADD COLUMN     "landImages" TEXT[],
ADD COLUMN     "patwariMap" TEXT,
ADD COLUMN     "satbara712" TEXT,
ADD COLUMN     "sowingCertificate" TEXT;
