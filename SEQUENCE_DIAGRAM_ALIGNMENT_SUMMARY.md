# Sequence Diagram Alignment Summary

This document summarizes the changes made to align the ClaimEasy project with the sequence diagram requirements and implement the requested enhancements.

## ✅ Completed Changes

### 1. Policy Request Enhancement
- **Farm Photos Upload**: Added support for uploading farm photos from different angles during policy request (new/renewal)
- **Crop Details**: Added comprehensive crop details fields:
  - Crop Variety
  - Expected Yield
  - Cultivation Season
  - Soil Type
  - Irrigation Method
  - Crop Description
- **Database Schema**: Updated `PolicyRequest` model to store `farmImages` and `cropDetails`

### 2. Policy Storage Enhancement
- **Policy Images**: When a policy is issued from a request, farm images are copied to the `Policy` model as `policyImages`
- **Crop Details**: Crop details from the request are stored in the policy for reference
- **Database Schema**: Updated `Policy` model to include `policyImages` and `cropDetails` fields

### 3. AI Image Matching
- **Policy-Claim Image Comparison**: Enhanced AI fraud detection to compare policy images (baseline) with claim images
- **Image Matching Score**: AI calculates similarity score between policy and claim images
- **Fraud Risk Assessment**: Based on image matching score:
  - High risk: < 30% similarity
  - Medium risk: 30-60% similarity
  - Low risk: > 60% similarity
- **Satellite Integration**: Enhanced satellite analysis to use policy images for baseline comparison

### 4. Visibility & Access Control
- **Admin Access**: Admin can view:
  - All policy requests with farmer details
  - Farm images uploaded during policy request
  - Documents uploaded during policy request
  - Claim images and documents
  - Policy images
- **Service Provider Access**: SP can view:
  - Policy requests assigned to them with farmer details
  - Farm images uploaded during policy request
  - Documents uploaded during policy request
  - Claim images and documents for assigned claims
  - Policy images for policies they issued
- **Routes Added**:
  - `/api/policy-requests/:requestId/farm-images/:imageIndex` - View farm images
  - `/api/policies/:policyId/images/:imageIndex` - View policy images
  - Updated `/api/claims/:claimId/files/:fileType/:fileIndex` - Uses ClaimDocument model

### 5. Service Provider Display
- **Policy View**: Approved SP information is displayed on farmer's policy view
- **Policy Card**: Shows SP name in policy cards
- **Policy Details**: Full SP information (name, email) available in policy details

### 6. AI Processing Enhancements
- **Fraud Detection**: Now includes:
  - Policy image matching with claim images
  - Location validation
  - Timestamp validation
  - Image authenticity checks
- **Satellite Analysis**: Enhanced to:
  - Compare satellite imagery with policy images (baseline)
  - Compare satellite imagery with claim images (damage assessment)
  - Calculate damage percentage based on satellite data
  - Generate comprehensive reports
- **Final Report**: AI generates final report with:
  - Image matching results
  - Damage percentage
  - Recommended amount
  - Fraud risk assessment
  - Validation flags

## 📋 Database Changes

### Migration: `add_policy_images_and_crop_details`

**PolicyRequest Table:**
- Added `farmImages` (JSONB) - Stores farm photos from different angles
- Added `cropDetails` (JSONB) - Stores detailed crop information

**Policy Table:**
- Added `policyImages` (JSONB) - Stores policy images for AI matching
- Added `cropDetails` (JSONB) - Stores crop details from policy request

## 🔄 Workflow Updates

### Policy Request Flow (New/Renewal)
1. Farmer selects service provider
2. Farmer enters crop type and insured area
3. **NEW**: Farmer uploads farm photos from different angles (required)
4. **NEW**: Farmer provides crop details (variety, yield, season, soil, irrigation, description)
5. Farmer uploads supporting documents (optional)
6. Request submitted to SP
7. SP reviews request with farmer details, farm images, and crop details
8. SP issues policy → Farm images copied to policy as `policyImages`

### Claim Processing Flow
1. Farmer raises claim with images and documents
2. System validates policy is active
3. **NEW**: AI fetches policy images from policy creation
4. **NEW**: AI compares claim images with policy images
5. **NEW**: AI uses satellite imagery for damage assessment
6. **NEW**: AI generates comprehensive report with:
   - Image matching score
   - Damage percentage
   - Recommended amount
   - Fraud risk assessment
7. SP reviews AI report and claim
8. SP approves/rejects/requests more info
9. Admin can override SP decisions

## 🎯 Alignment with Sequence Diagram

The implementation now aligns with the sequence diagram:

✅ **Registration & Login**: Already implemented
✅ **Policy Fetching**: Already implemented
✅ **Claim Raising**: Enhanced with policy image matching
✅ **AI Processing**: Enhanced with:
   - Policy image matching
   - Satellite image analysis
   - Comprehensive fraud detection
   - Final report generation
✅ **SP Review**: SP can view all farmer details, images, and documents
✅ **Admin Review**: Admin can view all farmer details, images, and documents
✅ **Claim Settlement**: Already implemented

## 📝 API Endpoints

### Policy Request
- `POST /api/policy-requests` - Create policy request (now accepts `farmImages` and crop details)
- `GET /api/policy-requests/:requestId/farm-images/:imageIndex` - View farm image
- `GET /api/policy-requests/:requestId/documents/:documentIndex` - View document

### Policy
- `GET /api/policies/:policyId/images/:imageIndex` - View policy image

### Claims
- `GET /api/claims/:claimId/files/:fileType/:fileIndex` - View claim document/image (updated to use ClaimDocument model)

## 🔍 Testing Checklist

- [ ] Policy request with farm images and crop details
- [ ] Policy issuance copies images to policy
- [ ] Admin can view policy request images and documents
- [ ] SP can view policy request images and documents
- [ ] AI image matching works correctly
- [ ] Satellite analysis uses policy images
- [ ] SP information displayed on policy view
- [ ] Claim images accessible to Admin and SP

## 🚀 Next Steps

1. Run database migration: `npx prisma migrate dev`
2. Test policy request flow with farm images
3. Test AI image matching functionality
4. Verify Admin and SP access to images/documents
5. Test satellite analysis integration (when API available)

## 📌 Notes

- Image matching currently uses mock similarity scores. In production, integrate with actual image similarity service (e.g., AWS Rekognition, Google Vision API)
- Satellite analysis currently uses mock data. In production, integrate with satellite imagery service (e.g., Google Earth Engine, Planet Labs)
- Policy images are required for new/renewal policy requests to enable AI matching during claim processing

