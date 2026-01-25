# Mobile App Integration Strategy

## 1. Unified Architecture
**YES, it will work perfectly.** Even if your Android app is built completely differently (e.g., Native Java/Kotlin, Flutter, or a different team), connecting it to the same server is the standard industry approach.

### **How it Works (The "Brain" is the Server)**
- **The Server (Brain):** Holds all the logic, database, and rules.
- **The Website (Face 1):** One way to look at and interact with the brain.
- **The Android App (Face 2):** A different way to look at and interact with the **SAME** brain.

### **API-First Design**
- **Current State:** Your Website (React) sends requests to the Backend (Node.js/Express).
- **Android App:** Will send HTTP requests (GET, POST) to the **SAME** Backend endpoints (e.g., `https://claimeasy.in/api/claims`).
- **Result:**
    - A farmer submits a claim on the **Android App**.
    - The data goes to the **Shared Database**.
    - The **Website** Admin Dashboard sees it instantly.

```mermaid
graph TD
    DB[(Shared Database)]
    Backend[Node.js Server (The Brain)]
    Web[Website Frontend]
    App[Android App (Native/Flutter)]

    Web -- JSON Data --> Backend
    App -- JSON Data --> Backend
    Backend -- SQL --> DB
```

## 2. Authentication (Login)
- The system uses **JWT (JSON Web Tokens)**.
- **How it works:** When a user logs in, they get a "token".
- **Mobile App:** The app will store this token safely (e.g., in SecureStore) and send it with every request, just like the website does.
- **Benefit:** No need to build a separate login system.

## 3. Notifications (The Critical Part)
For the app to receive alerts like "Claim Approved" even when closed:

1.  **Firebase Cloud Messaging (FCM):** You need to integrate FCM.
2.  **Backend Update:**
    - Currently, `notification.service.ts` sends emails and DB alerts.
    - We will add an `sendPushNotification` function to this service.
3.  **Flow:**
    - Admin approves claim -> Backend triggers `NotificationService` -> FCM sends alert -> Farmer's Phone vibrates.

## 4. How to Get a Domain Name
To replace your IP (`103.159.239.34`) with a professional name (e.g., `claimeasy.in`):

1.  **Buy the Domain:** Go to GoDaddy, Namecheap, or BigRock. Search for `claimeasy.in` and buy it (~₹500-1000/year).
2.  **DNS Configuration:**
    - Log in to your domain provider.
    - Go to **DNS Management**.
    - Add an **A Record**:
        - **Host:** `@`
        - **Value/Points to:** `103.159.239.34`
        - **TTL:** 1 Hour
3.  **Wait:** It takes 24-48 hours to propagate worldwide.

## 5. Next Steps for Mobile App
1.  **Choose Framework:** React Native is recommended because it uses the same language (JavaScript/TypeScript) as your current website.
2.  **Reuse Code:** You can share types, interfaces, and logic between the website and the app.
