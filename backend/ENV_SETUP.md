# Environment Variables Setup Guide

## 🔐 Required Environment Variables

The following environment variables are **required** for the application to work:

### 1. Database Configuration
```env
DATABASE_URL=postgresql://user:password@localhost:5432/claimeasy
```

### 2. JWT Secret
```env
JWT_SECRET=your-jwt-secret-key
```
**Generated Key:**
```
b66711441fca7271a3f352627a2c3b0b7cb796e6926765405cd5991792d9a843678d0e5665eee38c070783d02f2bfbd87cacb4bc71185bbdbb32d12c12d6397a
```

### 3. Encryption Key (for PII encryption)
```env
ENCRYPTION_KEY=your-encryption-key
```
**Generated Key:**
```
2da445ef399a3b78d66ce59d2fb72de534dc342621626103bd60d5edf0dc1214
```

### 4. Aadhaar HMAC Key (for Aadhaar hashing)
```env
AADHAAR_HMAC_KEY=your-hmac-key
```
**Generated Key:**
```
2574c5c4ce57430f67684726ac4d8020398df754949f6f0c3866b49c6bf7370f
```

### 5. Optional Configuration
```env
# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## 📝 Setup Instructions

### Step 1: Create .env File

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env  # On Windows: type nul > .env
```

### Step 2: Add Environment Variables

Copy the following into your `.env` file (replace with your actual database URL):

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/claimeasy

# JWT Secret
JWT_SECRET=b66711441fca7271a3f352627a2c3b0b7cb796e6926765405cd5991792d9a843678d0e5665eee38c070783d02f2bfbd87cacb4bc71185bbdbb32d12c12d6397a

# Encryption Key (for PII encryption)
ENCRYPTION_KEY=2da445ef399a3b78d66ce59d2fb72de534dc342621626103bd60d5edf0dc1214

# Aadhaar HMAC Key (for Aadhaar hashing)
AADHAAR_HMAC_KEY=2574c5c4ce57430f67684726ac4d8020398df754949f6f0c3866b49c6bf7370f

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 3: Update Database URL

Replace the `DATABASE_URL` with your actual PostgreSQL connection string:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/claimeasy
```

### Step 4: Verify Setup

Restart your backend server and try registering a farmer again.

---

## 🔄 Generate New Keys (Optional)

If you need to generate new keys, run:

```bash
cd backend
node scripts/generate-keys.js
```

This will generate new secure random keys for:
- JWT_SECRET
- ENCRYPTION_KEY
- AADHAAR_HMAC_KEY

---

## ⚠️ Security Notes

1. **Never commit `.env` file to version control**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Production Environment**
   - Use a secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
   - Rotate keys every 90 days
   - Use different keys for each environment

3. **Key Storage**
   - Keep keys secure
   - Don't share keys in chat/email
   - Use environment-specific keys

---

## 🐛 Troubleshooting

### Error: "AADHAAR_HMAC_KEY not configured"
- Make sure `.env` file exists in `backend` directory
- Check that `AADHAAR_HMAC_KEY` is set in `.env`
- Restart the backend server after adding variables

### Error: "ENCRYPTION_KEY not configured"
- Add `ENCRYPTION_KEY` to your `.env` file
- Restart the backend server

### Error: "JWT_SECRET not configured"
- Add `JWT_SECRET` to your `.env` file
- Restart the backend server

---

## ✅ Quick Setup Command

Run this in PowerShell (Windows) to create the .env file with all required variables:

```powershell
cd backend
@"
DATABASE_URL=postgresql://user:password@localhost:5432/claimeasy
JWT_SECRET=b66711441fca7271a3f352627a2c3b0b7cb796e6926765405cd5991792d9a843678d0e5665eee38c070783d02f2bfbd87cacb4bc71185bbdbb32d12c12d6397a
ENCRYPTION_KEY=2da445ef399a3b78d66ce59d2fb72de534dc342621626103bd60d5edf0dc1214
AADHAAR_HMAC_KEY=2574c5c4ce57430f67684726ac4d8020398df754949f6f0c3866b49c6bf7370f
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
"@ | Out-File -FilePath .env -Encoding utf8
```

**Remember to update DATABASE_URL with your actual database credentials!**

