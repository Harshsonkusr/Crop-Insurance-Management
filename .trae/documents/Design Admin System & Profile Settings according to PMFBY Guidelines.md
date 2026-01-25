I will redesign the **Admin System Settings** page to integrate **Admin Profile Management** and **PMFBY-specific Scheme Configurations**. This approach consolidates system-wide controls and personal admin settings into a unified, compliant interface.

### **1. Admin System Settings Page Redesign (`AdminSystemSettings.tsx`)**
I will refactor the existing page to use a **Tabbed Interface** with the following sections:

#### **Tab 1: Admin Profile (New)**
*   **Personal Details:** Name, Email, Mobile (Read-only/Editable).
*   **Security:** Change Password, Two-Factor Authentication (2FA) toggle for the admin's own account.
*   **Role Info:** Display current role and jurisdiction (e.g., "National Admin" or "State Admin - Maharashtra").

#### **Tab 2: PMFBY Scheme Configuration (New & Critical)**
*   **Season Management:**
    *   **Current Season:** Dropdown (Kharif / Rabi / Zaid).
    *   **Financial Year:** Dropdown (e.g., 2025-26).
    *   **Enrollment Cut-off Dates:** Date pickers for "Start Date" and "End Date" to enforce strict enrollment windows (preventing back-dated insurance).
*   **Premium & Subsidy Rules:**
    *   **Farmer Share Caps:** Inputs for Kharif (2%), Rabi (1.5%), and Commercial (5%).
    *   **Subsidy Ratios:** Inputs for Centre/State share (e.g., 50:50 or 90:10 for NE states).
*   **SLA Timelines:**
    *   **Claim Processing:** Days allowed for processing (e.g., 15 days).
    *   **Grievance Redressal:** Days allowed for resolution (e.g., 7 days).

#### **Tab 3: General System Settings (Existing)**
*   **Site Configuration:** Site Name, Date Format, Pagination limits.
*   **Maintenance Mode:** Toggle to lock the system during upgrades.

#### **Tab 4: Notification & Email (Existing)**
*   **SMTP Configuration:** Host, Port, User for sending system emails.
*   **Templates:** (Placeholder) for configuring SMS/Email templates for policy approvals.

### **2. Backend Implementation**
*   **Schema:** The existing `SystemSettings` model (Key-Value/JSON) is sufficient to store these new configurations without database migration.
    *   Key: `pmfby_scheme_rules` → Value: `{ season: 'Kharif', year: '2025', cutOffDate: '...' }`
    *   Key: `pmfby_sla_rules` → Value: `{ claimDays: 15, grievanceDays: 7 }`
*   **API:** The existing `systemSettings.routes.ts` already supports CRUD operations for these keys.

### **3. Verification**
*   **UI Check:** Verify all tabs render correctly and fields are editable.
*   **Data Persistence:** Ensure settings saved in the "PMFBY Scheme" tab persist after page reload.
*   **Profile Update:** Verify admin password/profile updates work via the existing auth endpoints.

This design directly addresses the need for **PMFBY compliance** (Strict Dates, Premium Rates) while cleaning up the **Admin Profile** experience.