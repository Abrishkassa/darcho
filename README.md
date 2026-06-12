# 🌾 Darcho - Ethiopian Coffee Marketplace

> **A transparent, direct-trade platform connecting Ethiopian coffee farmers with global buyers.**

![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0+-38B2AC?style=for-the-badge&logo=tailwind-css)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Live Demo:** [darcho.vercel.app](https://darcho.vercel.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

**Darcho** solves a critical problem in the Ethiopian coffee industry: **information asymmetry and unfair pricing**.

### The Problem
- 🚫 Farmers have limited market access
- 💰 Middlemen take most of the profit
- 📊 No transparent pricing information
- 🌍 Small farmers can't reach international buyers

### The Solution
A **web-based marketplace** where:
- ✅ Farmers list coffee lots with verified quality grades
- ✅ Global buyers discover authentic Ethiopian coffee
- ✅ Direct transactions with secure escrow
- ✅ Fair market-based pricing
- ✅ Real-time communication between parties

---

## ✨ Features

### 🌾 For Farmers
- **Product Management** - Upload verified coffee lots with quality certifications
- **Market Insights** - Real-time pricing data and demand analytics
- **Direct Messaging** - Communicate directly with international buyers
- **Order Tracking** - Monitor orders and transaction status
- **Dashboard Analytics** - View sales performance and revenue trends
- **Profile Management** - Showcase your farm and certifications

### 🛒 For Buyers
- **Browse & Filter** - Search coffee by region, grade, and certifications
- **Quality Verification** - Third-party grading scores and certifications
- **Shopping Cart** - Build orders from multiple farmers
- **Secure Payments** - Escrow system ensuring safe transactions
- **Favorites** - Save preferred products and farmers
- **Order History** - Track all purchases and reorder easily

### 🔒 For Both
- **Secure Authentication** - NextAuth.js with bcrypt encryption
- **Real-time Chat** - Connect and negotiate directly
- **Transaction Security** - Escrow-based payment system
- **Mobile Responsive** - Full mobile support for farmers in rural areas

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript 5.0
- **UI Library:** React 19 with React Compiler
- **Styling:** Tailwind CSS 4 + PostCSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** MySQL with Prisma ORM
- **Authentication:** NextAuth.js 4.24
- **Backend API:** Supabase
- **Encryption:** bcryptjs for password hashing

### DevOps & Tools
- **Deployment:** Vercel
- **Package Manager:** npm/yarn
- **Linting:** ESLint 9
- **Version Control:** Git

---

## 📁 Project Structure

```
darcho/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (dash)/                   # Dashboard layout group
│   │   ├── admin/                    # Admin panel
│   │   ├── buyer/                    # Buyer interface
│   │   ├── farmer/                   # Farmer interface
│   │   ├── login/                    # Authentication
│   │   ├── register/                 # Registration
│   │   ├── forgot/                   # Password recovery
│   │   ├── api/                      # Backend API routes
│   │   │   ├── auth/                 # Auth endpoints
│   │   │   ├── buyer/                # Buyer APIs (products, cart, orders)
│   │   │   ├── farmer/               # Farmer APIs
│   │   │   └── register/             # Registration endpoints
│   │   ├── components/               # Reusable React components
│   │   ├── lib/                      # App utilities
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── providers.tsx             # NextAuth provider
│   │
│   ├── hooks/                        # Custom React hooks
│   │   └── useBuyer.ts               # Buyer-specific hooks
│   │
│   ├── lib/                          # Global utilities
│   │   ├── api.ts                    # API client with typed methods
│   │   ├── auth.ts                   # NextAuth configuration
│   │   ├── prisma.ts                 # Prisma client (singleton)
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── types/                        # TypeScript interfaces
│   │   ├── buyer.ts                  # Buyer data types
│   │   └── next-auth.d.ts            # Auth type extensions
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── prisma/                           # Database schema
│   └── schema.prisma                 # Prisma ORM schema
│
├── public/                           # Static assets
├── .env.example                      # Environment variables template
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Git** for version control
- **Supabase** account (for backend)
- **MySQL** database (cloud or local)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Abrishkassa/darcho.git
cd darcho
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables** (see below)
```bash
cp .env.example .env.local
```

4. **Initialize the database**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your_secret_key_here_generate_with_openssl
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=mysql://username:password@localhost:3306/darcho_db

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: Third-party services
STRIPE_PUBLIC_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "securePassword123",
  "fullName": "John Farmer",
  "role": "farmer"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "securePassword123"
}
```

### Buyer API Endpoints

#### Get Products
```bash
GET /api/buyer/products?page=1&limit=20&region=Sidamo
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Yirgacheffe Washed",
      "grade": "A",
      "pricePerUnit": 5.50,
      "quantity": 100,
      "unit": "kg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasNextPage": true
  }
}
```

#### Add to Cart
```bash
POST /api/buyer/cart
Content-Type: application/json

{
  "productId": 1,
  "quantity": 10
}
```

#### Place Order
```bash
POST /api/buyer/orders
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "pricePerUnit": 5.50
    }
  ]
}
```

#### Get Chat Messages
```bash
GET /api/buyer/chats/:farmerId
```

#### Send Message
```bash
POST /api/buyer/chats
Content-Type: application/json

{
  "farmerId": 5,
  "message": "Is this product available?",
  "orderId": null
}
```

---

## 🔑 Authentication

This project uses **NextAuth.js** with a credentials provider for secure authentication.

### How It Works

1. **User Registration** → Password hashed with bcryptjs
2. **Login** → Credentials verified against database
3. **JWT Token** → Secure session token generated
4. **Session** → NextAuth manages user session
5. **Protected Routes** → API routes check authentication

### Protected API Routes

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your protected logic here
}
```

### Client-Side Authentication

```typescript
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Component() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  
  return session ? (
    <button onClick={() => signOut()}>Sign Out</button>
  ) : (
    <button onClick={() => signIn()}>Sign In</button>
  );
}
```

---

## 💻 Development

### Running Tests
```bash
npm run test
```

### Linting & Formatting
```bash
# Check for linting errors
npm run lint

# Format code
npm run format
```

### Database Migrations
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# View database in GUI
npx prisma studio
```

### Code Structure Best Practices

- **Components:** Reusable UI components in `src/app/components/`
- **Hooks:** Custom logic in `src/hooks/`
- **API Routes:** Backend endpoints organized by feature
- **Types:** Centralized TypeScript interfaces in `src/types/`
- **Utils:** Helper functions in `src/lib/`

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

### Environment Variables on Vercel

Add all `.env.local` variables to Vercel project settings:
- Production: Set all environment variables
- Preview: Same as production
- Development: Set locally only

### Post-Deployment

- Monitor with Vercel Analytics
- Set up error tracking (Sentry)
- Configure custom domain
- Enable HTTPS (automatic on Vercel)

---

## 📊 Performance Metrics

- **Next.js React Compiler:** Enabled for better performance
- **Image Optimization:** Using Next.js Image component
- **Code Splitting:** Automatic route-based splitting
- **CSS:** Tailwind CSS with PurgeCSS for minimal bundle
- **Animations:** Framer Motion for smooth interactions

---

## 🤝 Contributing

This is a portfolio project, but here's how to extend it:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Project Statistics

- **Lines of Code:** ~2,500+
- **Components:** 15+
- **API Routes:** 20+
- **Custom Hooks:** 3+
- **Type Definitions:** 50+
- **Development Time:** Ongoing

---

## 🐛 Known Issues & Future Improvements

### Known Issues
- [ ] CORS headers need restriction (security)
- [ ] Input validation needed on API routes
- [ ] Rate limiting not implemented
- [ ] Email verification pending

### Planned Features
- [ ] Payment integration (Stripe)
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app with React Native
- [ ] AI-powered price predictions
- [ ] Quality verification system
- [ ] Shipping integration

---

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Guide](https://next-auth.js.org)
- [Prisma ORM](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Abrishka** - Full Stack Developer
- GitHub: [@Abrishkassa](https://github.com/Abrishkassa)
- Portfolio: [Your Portfolio URL]
- Email: your.email@example.com

---

## ❤️ Support

If you found this project helpful, please consider:
- ⭐ Giving it a star on GitHub
- 🔗 Sharing it with others
- 💬 Providing feedback or suggestions

---

## 🙏 Acknowledgments

- Ethiopian coffee farmers and traders
- Next.js and React communities
- Contributors and supporters

---

**Last Updated:** June 2026  
**Version:** 1.0.0  
**Status:** Active Development
