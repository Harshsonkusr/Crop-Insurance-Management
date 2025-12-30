/*
  Warnings:

  - You are about to drop the column `aadhaarNumber` on the `FarmDetails` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[aadhaarHash]` on the table `FarmDetails` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PolicySource" AS ENUM ('internal', 'external');

-- CreateEnum
CREATE TYPE "PolicySyncStatus" AS ENUM ('synced', 'stale', 'pending', 'failed');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('aadhaar_lookup', 'aadhaar_linking', 'policy_sync', 'data_sharing');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('active', 'revoked', 'expired');

-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('pending', 'completed', 'failed');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "changes" JSONB,
ADD COLUMN     "resourceId" TEXT,
ADD COLUMN     "resourceType" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "adminOverrideAt" TIMESTAMP(3),
ADD COLUMN     "adminOverrideReason" TEXT,
ADD COLUMN     "aiDamagePercent" DOUBLE PRECISION,
ADD COLUMN     "aiRecommendedAmount" DOUBLE PRECISION,
ADD COLUMN     "aiReport" JSONB,
ADD COLUMN     "aiValidationFlags" JSONB;

-- AlterTable
ALTER TABLE "ClaimDocument" ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "scanResult" JSONB,
ADD COLUMN     "scanned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FarmDetails" DROP COLUMN "aadhaarNumber",
ADD COLUMN     "aadhaarHash" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "village" TEXT;

-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "externalPolicyId" TEXT,
ADD COLUMN     "externalSyncAt" TIMESTAMP(3),
ADD COLUMN     "insurerApiResponse" JSONB,
ADD COLUMN     "policyVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" "PolicySource" NOT NULL DEFAULT 'internal',
ADD COLUMN     "syncStatus" "PolicySyncStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "kycDocuments" JSONB,
ADD COLUMN     "kycVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licenseNumber" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailEncrypted" TEXT,
ADD COLUMN     "mobileNumberEncrypted" TEXT;

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "consentText" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "deviceInfo" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'active',
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "claimId" TEXT,
    "status" "IdempotencyStatus" NOT NULL DEFAULT 'pending',
    "requestBody" JSONB,
    "responseBody" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyRequest" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "serviceProviderId" TEXT,
    "cropType" TEXT NOT NULL,
    "insuredArea" DOUBLE PRECISION NOT NULL,
    "requestedStartDate" TIMESTAMP(3),
    "documents" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "issuedPolicyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiTask" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "inputData" JSONB,
    "outputData" JSONB,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Consent_userId_consentType_idx" ON "Consent"("userId", "consentType");

-- CreateIndex
CREATE INDEX "Consent_granted_idx" ON "Consent"("granted");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_status_idx" ON "Session"("userId", "status");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_refreshToken_idx" ON "Session"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");

-- CreateIndex
CREATE INDEX "IdempotencyKey_key_idx" ON "IdempotencyKey"("key");

-- CreateIndex
CREATE INDEX "IdempotencyKey_claimId_idx" ON "IdempotencyKey"("claimId");

-- CreateIndex
CREATE INDEX "IdempotencyKey_status_expiresAt_idx" ON "IdempotencyKey"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "PolicyRequest_farmerId_status_idx" ON "PolicyRequest"("farmerId", "status");

-- CreateIndex
CREATE INDEX "PolicyRequest_serviceProviderId_status_idx" ON "PolicyRequest"("serviceProviderId", "status");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_endpoint_windowEnd_idx" ON "RateLimit"("identifier", "endpoint", "windowEnd");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_identifier_endpoint_windowStart_key" ON "RateLimit"("identifier", "endpoint", "windowStart");

-- CreateIndex
CREATE INDEX "AiTask_claimId_status_idx" ON "AiTask"("claimId", "status");

-- CreateIndex
CREATE INDEX "AiTask_status_createdAt_idx" ON "AiTask"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Claim_farmerId_status_idx" ON "Claim"("farmerId", "status");

-- CreateIndex
CREATE INDEX "Claim_assignedToId_status_idx" ON "Claim"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "Claim_policyId_idx" ON "Claim"("policyId");

-- CreateIndex
CREATE INDEX "ClaimDocument_claimId_idx" ON "ClaimDocument"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmDetails_aadhaarHash_key" ON "FarmDetails"("aadhaarHash");

-- CreateIndex
CREATE INDEX "FarmDetails_aadhaarHash_idx" ON "FarmDetails"("aadhaarHash");

-- CreateIndex
CREATE INDEX "Policy_farmerId_status_idx" ON "Policy"("farmerId", "status");

-- CreateIndex
CREATE INDEX "Policy_serviceProviderId_idx" ON "Policy"("serviceProviderId");

-- CreateIndex
CREATE INDEX "Policy_source_syncStatus_idx" ON "Policy"("source", "syncStatus");

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyKey" ADD CONSTRAINT "IdempotencyKey_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyRequest" ADD CONSTRAINT "PolicyRequest_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyRequest" ADD CONSTRAINT "PolicyRequest_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "ServiceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
