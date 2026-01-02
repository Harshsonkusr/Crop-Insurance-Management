# Smart Crop Claim Assist (ClaimEasy)

## AI-Powered Digital Solution for PMFBY Agricultural Insurance Claims

ClaimEasy is an artificial intelligence-powered digital solution that transforms the Pradhan Mantri Fasal Bima Yojana (PMFBY) agricultural insurance claim procedure. The system leverages AI technology, satellite imagery, cloud integration, and mobile technology to streamline the crop insurance claim process.

### Key Features

- 🚀 **Reduced Processing Time**: From 5-6 months to under 1 month
- 🤖 **AI-Powered Damage Assessment**: Automated crop damage detection using satellite imagery
- 📱 **Farmer-Friendly Interface**: Easy claim submission with mobile support
- 🔒 **Secure Authentication**: Role-based access control with OTP verification
- 📊 **Real-Time Tracking**: Monitor claim status throughout the process
- 🛡️ **Fraud Detection**: Automated verification and validation

### Technology Stack

**Frontend:**
- React 18.3.1 with TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

**Backend:**
- Node.js with Express.js (Express 5)
- TypeScript
- PostgreSQL with Prisma ORM
- JWT Authentication

## Quick Start

### Prerequisites

- Node.js 22+ and npm
- PostgreSQL database
- Environment variables configured

### Installation & Deployment

This project uses a **Unified Deployment** strategy where the backend serves the frontend.

```bash
# Clone the repository
git clone https://github.com/Harshsonkusr/Crop-Insurance-Management.git
cd ClaimEasy

# Install dependencies (Root)
npm install

# Install backend dependencies
cd backend
npm install

# Run database migrations
npx prisma migrate dev

# Start development (Both Frontend & Backend)
npm run dev:full
```

### Deployment

For production deployment (Render/Railway), see the [Deployment Guide](./DEPLOYMENT.md).

### Default Test Users

- **Admin**: admin@claimeasy.com / password123 (after seeding)
- **Farmer**: mobile 1234567890 (OTP-based login)

## Project Structure

```
ClaimEasy/
├── backend/          # Backend API server
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── models/   # Database models
│   │   ├── services/ # Business logic
│   │   └── middleware/ # Auth & error handling
│   └── package.json
├── src/              # Frontend React application
│   ├── components/   # React components
│   ├── pages/        # Page components
│   ├── lib/          # Utilities and API client
│   └── config.ts     # Configuration
└── README.md
```

## Documentation

- [Project Documentation](./PROJECT_DOCUMENTATION.md) - Comprehensive project overview
- [Testing Guide](./TESTING_GUIDE.md) - Testing instructions
- [Quick Start Testing](./QUICK_START_TESTING.md) - Quick testing guide
- [Backend Fixes Summary](./BACKEND_FIXES_SUMMARY.md) - Backend implementation details

## Features

### For Farmers
- Digital claim submission with photos and location
- OTP-based secure authentication
- Real-time claim status tracking
- Policy management
- Farm details registration

### For Service Providers
- Claim verification and processing
- Field inspection tools
- Crop and farmer management
- Policy creation
- Report generation

### For Administrators
- User management
- System-wide claim oversight
- Analytics dashboard
- Audit logs
- System configuration

## API Documentation

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for detailed API documentation.

## Contributing

This project is part of the PMFBY digital transformation initiative. For contributions, please follow the project guidelines.

## License

[Specify license information]

## Contact

For questions or issues, please contact the development team.
