
I will implement the requested features to synchronize farmer data, visualize farm boundaries, and auto-fetch details for forms.

### **1. Backend: Database & API Updates**
*   **Schema Update**: Modify `FarmDetails` in `prisma/schema.prisma` to include:
    *   `boundaryCoordinates`: `Json` field to store map polygon points.
    *   Document fields: `satbara712`, `patwariMap`, `sowingCertificate`, `bankPassbook`, `aadhaarCard`, and `landImages`.
*   **Signup Logic**: Update `auth.routes.ts` to save the file paths of uploaded documents (Satbara, Aadhaar, etc.) into the database during signup.
*   **Profile API**: Update `GET /api/farmer/profile` to return these documents and coordinates.
*   **Update API**: Create/Update endpoints to allow saving farm boundary coordinates from the map.

### **2. Frontend: Profile & Farm Settings**
*   **Documents Tab**: Add a section in `ProfileSettings.tsx` to view/manage uploaded documents (e.g., "View 7/12 Extract").
*   **Farm Boundary Map**:
    *   Integrate `@react-google-maps/api` into `ProfileSettings` (or a new "Farm Map" section).
    *   Allow farmers to draw their farm boundaries or select points.
    *   Visualize the saved boundary on the map.

### **3. Frontend: Auto-fetch for Forms**
*   **Policy & Claim Forms**: Update `ClaimSubmission.tsx` and `PolicyRequest.tsx` to:
    *   Fetch farmer profile and farm details on load.
    *   Auto-fill common fields (Name, Mobile, Aadhaar, Survey Number, District, Village).
    *   (Optional) Allow selecting pre-uploaded documents from the profile instead of re-uploading.

**Verification Plan:**
*   **Signup**: Register a new farmer with files and verify they are saved in the DB.
*   **Profile**: Check if documents and details appear in `ProfileSettings`.
*   **Map**: Draw a boundary, save it, and refresh to ensure it persists.
*   **Forms**: Open a new Claim form and verify that personal/farm details are already filled.
