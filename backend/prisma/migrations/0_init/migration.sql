-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'INSURER', 'FARMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'banned', 'pending');

-- CreateEnum
CREATE TYPE "InsurerStatus" AS ENUM ('active', 'inactive', 'pending');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('Active', 'Inactive', 'Expired');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'approved', 'rejected', 'in_progress', 'resolved', 'cancelled', 'under_review', 'fraud_suspect', 'Inspected');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('Pending', 'AI_Processed_Admin_Review', 'AI_Satellite_Processed', 'Manual_Review', 'Verified', 'fraud_suspect');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('light', 'dark');

-- CreateEnum
CREATE TYPE "FileKind" AS ENUM ('document', 'image');

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

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "mobileNumber" TEXT,
    "mobileNumberEncrypted" TEXT,
    "emailEncrypted" TEXT,
    "otp" TEXT,
    "otpExpires" TIMESTAMP(3),
    "gender" TEXT,
    "dateOfBirth" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insurer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "state" TEXT,
    "district" TEXT,
    "businessName" TEXT,
    "insurerType" TEXT,
    "serviceDescription" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "licenseNumber" TEXT,
    "licenseExpiryDate" TIMESTAMP(3),
    "aiCertified" BOOLEAN NOT NULL DEFAULT false,
    "serviceArea" TEXT,
    "serviceType" TEXT NOT NULL,
    "kycVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycDocuments" JSONB,
    "status" "InsurerStatus" NOT NULL DEFAULT 'pending',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insurer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "insurerId" TEXT NOT NULL,
    "landRecordKhasra" TEXT,
    "cropType" TEXT NOT NULL,
    "insuredArea" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PolicyStatus" NOT NULL DEFAULT 'Active',
    "premium" DOUBLE PRECISION NOT NULL,
    "sumInsured" DOUBLE PRECISION NOT NULL,
    "source" "PolicySource" NOT NULL DEFAULT 'internal',
    "policyVerified" BOOLEAN NOT NULL DEFAULT false,
    "externalSyncAt" TIMESTAMP(3),
    "syncStatus" "PolicySyncStatus" NOT NULL DEFAULT 'pending',
    "externalPolicyId" TEXT,
    "insurerApiResponse" JSONB,
    "policyImages" JSONB,
    "policyDocuments" JSONB,
    "cropDetails" JSONB,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "chosenPolicyId" TEXT,
    "farmerId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "description" TEXT NOT NULL,
    "locationOfIncident" TEXT NOT NULL,
    "dateOfIncident" TIMESTAMP(3) NOT NULL,
    "dateOfClaim" TIMESTAMP(3) NOT NULL,
    "amountClaimed" DOUBLE PRECISION,
    "status" "ClaimStatus" NOT NULL DEFAULT 'pending',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'Pending',
    "resolutionDetails" TEXT,
    "resolutionDate" TIMESTAMP(3),
    "notes" TEXT[],
    "aiDamageAssessment" JSONB,
    "satelliteVerification" JSONB,
    "verificationData" JSONB,
    "inspectionReport" JSONB,
    "damageConfirmation" TEXT,
    "fraudFlaggedAt" TIMESTAMP(3),
    "aiDamagePercent" DOUBLE PRECISION,
    "aiRecommendedAmount" DOUBLE PRECISION,
    "aiValidationFlags" JSONB,
    "aiReport" JSONB,
    "adminOverrideReason" TEXT,
    "adminOverrideAt" TIMESTAMP(3),
    "payoutAmount" DOUBLE PRECISION,
    "payoutDate" TIMESTAMP(3),
    "payoutTransactionId" TEXT,
    "payoutStatus" TEXT DEFAULT 'pending',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimDocument" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "kind" "FileKind" NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "checksum" TEXT,
    "scanned" BOOLEAN NOT NULL DEFAULT false,
    "scanResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmDetails" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "farmId" TEXT,
    "farmName" TEXT,
    "location" TEXT,
    "address" TEXT,
    "district" TEXT,
    "village" TEXT,
    "area" DOUBLE PRECISION,
    "farmSize" TEXT,
    "crops" TEXT[],
    "cropType" TEXT,
    "soilType" TEXT,
    "irrigationMethod" TEXT,
    "ownerName" TEXT,
    "aadhaarHash" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "casteCategory" TEXT,
    "farmerType" TEXT,
    "farmerCategory" TEXT,
    "loaneeStatus" TEXT,
    "state" TEXT,
    "tehsil" TEXT,
    "pincode" TEXT,
    "landRecordKhasra" TEXT,
    "landRecordKhatauni" TEXT,
    "surveyNumber" TEXT,
    "landAreaSize" DOUBLE PRECISION,
    "insuranceUnit" TEXT,
    "cropName" TEXT,
    "cropVariety" TEXT,
    "cropSeason" TEXT,
    "insuranceLinked" BOOLEAN NOT NULL DEFAULT false,
    "wildAnimalAttackCoverage" BOOLEAN NOT NULL DEFAULT false,
    "bankName" TEXT,
    "bankAccountNo" TEXT,
    "bankIfsc" TEXT,
    "satbaraImage" TEXT,
    "patwariMapImage" TEXT,
    "sowingCertificate" TEXT,
    "bankPassbookImage" TEXT,
    "aadhaarCardImage" TEXT,
    "landImage1" TEXT,
    "landImage1Gps" TEXT,
    "landImage2" TEXT,
    "landImage2Gps" TEXT,
    "landImage3" TEXT,
    "landImage3Gps" TEXT,
    "landImage4" TEXT,
    "landImage4Gps" TEXT,
    "landImage5" TEXT,
    "landImage5Gps" TEXT,
    "landImage6" TEXT,
    "landImage6Gps" TEXT,
    "landImage7" TEXT,
    "landImage7Gps" TEXT,
    "landImage8" TEXT,
    "landImage8Gps" TEXT,
    "verificationStatus" TEXT DEFAULT 'Pending',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "insurerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "expectedYield" DOUBLE PRECISION,
    "cultivationSeason" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "changes" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "settingName" TEXT NOT NULL,
    "settingValue" JSONB NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sidebarOpen" BOOLEAN NOT NULL DEFAULT true,
    "theme" "Theme" NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "notificationsEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificationsSms" BOOLEAN NOT NULL DEFAULT false,
    "notificationsPush" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

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
    "insurerId" TEXT,
    "cropType" TEXT NOT NULL,
    "insuredArea" DOUBLE PRECISION NOT NULL,
    "requestedStartDate" TIMESTAMP(3),
    "documents" JSONB,
    "farmImages" JSONB,
    "cropDetails" JSONB,
    "paymentDetails" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "issuedPolicyId" TEXT,
    "deletedAt" TIMESTAMP(3),
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

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobileNumber_key" ON "User"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Insurer_userId_key" ON "Insurer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Insurer_email_key" ON "Insurer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Insurer_phone_key" ON "Insurer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_policyNumber_key" ON "Policy"("policyNumber");

-- CreateIndex
CREATE INDEX "Policy_farmerId_status_idx" ON "Policy"("farmerId", "status");

-- CreateIndex
CREATE INDEX "Policy_insurerId_idx" ON "Policy"("insurerId");

-- CreateIndex
CREATE INDEX "Policy_source_syncStatus_idx" ON "Policy"("source", "syncStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimId_key" ON "Claim"("claimId");

-- CreateIndex
CREATE INDEX "Claim_farmerId_status_idx" ON "Claim"("farmerId", "status");

-- CreateIndex
CREATE INDEX "Claim_assignedToId_status_idx" ON "Claim"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "Claim_policyId_idx" ON "Claim"("policyId");

-- CreateIndex
CREATE INDEX "ClaimDocument_claimId_idx" ON "ClaimDocument"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmDetails_farmerId_key" ON "FarmDetails"("farmerId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmDetails_aadhaarHash_key" ON "FarmDetails"("aadhaarHash");

-- CreateIndex
CREATE INDEX "FarmDetails_aadhaarHash_idx" ON "FarmDetails"("aadhaarHash");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_settingName_key" ON "SystemSettings"("settingName");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

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
CREATE INDEX "PolicyRequest_insurerId_status_idx" ON "PolicyRequest"("insurerId", "status");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_endpoint_windowEnd_idx" ON "RateLimit"("identifier", "endpoint", "windowEnd");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_identifier_endpoint_windowStart_key" ON "RateLimit"("identifier", "endpoint", "windowStart");

-- CreateIndex
CREATE INDEX "AiTask_claimId_status_idx" ON "AiTask"("claimId", "status");

-- CreateIndex
CREATE INDEX "AiTask_status_createdAt_idx" ON "AiTask"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Insurer" ADD CONSTRAINT "Insurer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_chosenPolicyId_fkey" FOREIGN KEY ("chosenPolicyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimDocument" ADD CONSTRAINT "ClaimDocument_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmDetails" ADD CONSTRAINT "FarmDetails_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyKey" ADD CONSTRAINT "IdempotencyKey_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyRequest" ADD CONSTRAINT "PolicyRequest_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyRequest" ADD CONSTRAINT "PolicyRequest_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

