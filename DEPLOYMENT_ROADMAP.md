# 🚀 ClaimEasy Complete Deployment Roadmap

This document outlines the step-by-step process to deploy the ClaimEasy project to your VPS, connect the Android App, and manage future domain upgrades.

---

## 📦 Phase 1: Immediate Deployment (IP-Based)
**Goal:** Get the website live at `http://103.159.239.34` with working OTPs.

### Step 1: Prepare the VPS

#### ⚠️ CRITICAL: Password Issues
The default password `J^Lc+U4YSZW2$&pZ4ja(i)` is very difficult to type/paste correctly because of the special symbols (`^`, `$`, `&`, `(`).

**If you get "Permission Denied" or "Connection closed":**
1.  **STOP trying the old password.** The server might block you for too many failed attempts.
2.  Log in to your **Hosting Provider Dashboard**.
3.  Find the **"Reset Root Password"** or **"Change Password"** option for this VPS.
4.  Set a simpler password (only letters and numbers), for example: `CropAdmin2026Secure`
5.  Wait 1-2 minutes.
6.  Try logging in again with the new password.

#### Connect via SSH
1. Open your terminal (PowerShell/Command Prompt).
2. Connect to your VPS:
   ```bash
   ssh root@103.159.239.34
   # Use the NEW password you just set.
   ```

### Step 2: Run Automated Deployment
Copy and run this command block on the VPS. It installs Node.js, Nginx, Database, and sets up the project.
```bash
# Download and run the deployment script
curl -O https://raw.githubusercontent.com/Harshsonkusr/Crop-Insurance-Management/main/deploy_vps.sh
chmod +x deploy_vps.sh
./deploy_vps.sh
```

### Step 3: Activate OTP Service (Twilio)
The deployment script deliberately skips sensitive keys for security. You must add them manually once.
Run this **exact command** on the VPS (Replace with your actual keys):
```bash
cat <<EOT >> /var/www/claimeasy/backend/.env

# Twilio Configuration (Real SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
EOT
```

### Step 4: Final Restart
Apply all changes:
```bash
pm2 restart claimeasy-backend
```
✅ **Result:** Website is live at `http://103.159.239.34`. OTPs will be sent to real phones.

---

## 💾 Storage Service Explanation
**Current Status:** `Local VPS Storage`
- **How it works:** When a farmer uploads a document, it is saved directly to the VPS hard drive in `/var/www/claimeasy/backend/uploads`.
- **Is it safe?** Yes, for a single server.
- **Backup:** You should periodically backup the `/uploads` folder.
- **Future Upgrade:** If you run out of space, we can switch to AWS S3 or Cloudinary without changing the app logic significantly.

---

## 📱 Phase 2: Connecting the Android App
**Goal:** Make your Android App talk to the live server.

### Step 1: Update API Base URL in Android Project
Open your Android project (Android Studio/Flutter/Java). Find the file where you define the API URL (usually `RetrofitClient.java`, `ApiConfig.java`, or `constants.dart`).

**Change this:**
```java
// Old (Localhost)
String BASE_URL = "http://10.0.2.2:5000/api/"; 
```
**To this:**
```java
// New (VPS IP)
String BASE_URL = "http://103.159.239.34/api/";
```

### Step 2: Update Network Security Config (Crucial for HTTP)
Since you are using an IP address (HTTP, not HTTPS yet), Android blocks cleartext traffic by default. You must allow it.

1. Create/Open `res/xml/network_security_config.xml`:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <network-security-config>
       <domain-config cleartextTrafficPermitted="true">
           <domain includeSubdomains="true">103.159.239.34</domain>
       </domain-config>
   </network-security-config>
   ```
2. Reference this in your `AndroidManifest.xml`:
   ```xml
   <application
       android:networkSecurityConfig="@xml/network_security_config"
       ...>
   ```

### Step 3: Build & Test
Build the APK and install it on a phone. It will now register users and fetch data from your VPS.

---

## 🌐 Phase 3: Future Domain Switch (Upgrade)
**Goal:** Switch from `http://103.159.239.34` to `https://claimeasy.com`.

### Step 1: Buy & Point Domain
1. Buy domain (e.g., `claimeasy.com`).
2. Go to DNS Settings.
3. Add **A Record**: Host `@` -> Value `103.159.239.34`.

### Step 2: Run Domain Script (On VPS)
I have already prepared a script for this. When you are ready:
```bash
# Run this on VPS
curl -O https://raw.githubusercontent.com/Harshsonkusr/Crop-Insurance-Management/main/setup_domain.sh
chmod +x setup_domain.sh
sudo ./setup_domain.sh
```
*It will ask for your domain name, configure Nginx, and install free SSL.*

### Step 3: Update Android App Again
Once you have the domain (HTTPS), update the app URL again:
```java
// Final (Secure Domain)
String BASE_URL = "https://claimeasy.com/api/";
```
*You can then remove the `network_security_config` exception since HTTPS is secure by default.*
