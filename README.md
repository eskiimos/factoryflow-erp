# FactoryFlow ERP

Complete Production Management System built with Next.js 15, TypeScript, and Prisma.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 + React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Prisma
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/                # Next.js App Router
├── components/         # React components
├── lib/               # Utilities and configurations
└── types/             # TypeScript type definitions
```

## 🔧 Features

- Product lifecycle management
- Cost calculation system
- Intelligent pricing
- Material & work type management
- Employee & department management
- Budget planning
- Order management
- Production calculator

## 📊 Database

The project uses Prisma ORM with:
- SQLite for development
- PostgreSQL for production

## 🚀 Deployment

Deploy to Vercel with one click or use the Vercel CLI:

```bash
vercel --prod
```

## 📄 License

MIT License - see LICENSE file for details.
