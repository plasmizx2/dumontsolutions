# Setup Guide - Web Development Agency Site

Complete step-by-step guide to get your agency website up and running.

## Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
cp .env.example .env.local

# 3. Edit .env.local with your values (see below)

# 4. Set up database
npx prisma migrate dev --name init

# 5. Create admin user
npx ts-node scripts/create-admin.ts

# 6. Start dev server
npm run dev
```

Visit http://localhost:3000

## Detailed Setup

### 1. Database Setup

#### Option A: Local PostgreSQL

```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb agency_site

# Get connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/agency_site"
```

#### Option B: Remote PostgreSQL (Recommended for Production)

- Use Render: https://render.com/docs/databases
- Use Neon: https://neon.tech
- Use AWS RDS, DigitalOcean, or others

### 2. Environment Variables

Create `.env.local`:

```env
# Database (required)
DATABASE_URL="postgresql://user:password@localhost:5432/agency_site"

# Stripe (https://dashboard.stripe.com/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY_HERE

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Email Configuration (example: Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your-app-password-not-regular-password
SMTP_FROM=noreply@yoursite.com

# Admin contact email
ADMIN_EMAIL=your.email@yoursite.com
```

#### Getting Stripe Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy "Publishable key" (starts with `pk_`)
3. Copy "Secret key" (starts with `sk_`)
4. For webhook secret, see "Stripe Webhook Setup" below

#### Getting Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled
3. Create "App Password"
4. Use that 16-character password in `SMTP_PASSWORD`

### 3. Database Initialization

```bash
# Create tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to see your database
npx prisma studio
```

### 4. Create Admin User

```bash
npx ts-node scripts/create-admin.ts
```

Follow the prompts to create your admin account.

### 5. Stripe Webhook Setup (for local testing)

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows/Linux: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Start webhook listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output:
# > Ready! Your webhook signing secret is: whsec_xxxx...

# Add the secret to .env.local as STRIPE_WEBHOOK_SECRET
```

### 6. Start Development Server

```bash
npm run dev
```

Visit:
- **Landing**: http://localhost:3000
- **Pricing**: http://localhost:3000/pricing
- **Contact**: http://localhost:3000/contact
- **Admin**: http://localhost:3000/admin/login

## Testing the Full Flow

### 1. Sign Up a Client

1. Go to http://localhost:3000/pricing
2. Click "Get Started" on any plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Enter any future date for expiry (e.g., 12/25)
5. Enter any 3-digit CVC (e.g., 123)
6. Complete checkout

### 2. View in Admin Dashboard

1. Go to http://localhost:3000/admin/login
2. Login with your admin credentials
3. View clients, payments, and subscriptions

### 3. Test Contact Form

1. Go to http://localhost:3000/contact
2. Fill out and submit form
3. Check email to verify contact submission was sent

## Common Issues

### "Error: P1000: Can't reach database server"
- PostgreSQL is not running
- DATABASE_URL is incorrect
- Check with: `psql $DATABASE_URL`

### "Authentication failed" on email
- Gmail: Make sure you're using App Password, not account password
- Other providers: Check SMTP credentials
- Consider using Sendgrid (more reliable): https://sendgrid.com

### "stripe-signature verification failed"
- Make sure STRIPE_WEBHOOK_SECRET is correct
- If using local testing, run `stripe listen` command
- For production, add webhook URL in Stripe dashboard

### "NextAuth secret not provided"
- Generate new secret: `openssl rand -base64 32`
- Add to `.env.local` as NEXTAUTH_SECRET

## Stripe Configuration

### Create Products (for Stripe dashboard)

1. Go to https://dashboard.stripe.com/products
2. Create "Basic Site" - Price: $150
3. Create "Site Package" - Price: $150
4. Create "Maintenance" - Price: $50/month (recurring)

### Set Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add Endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Events to select:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`

## Email Customization

Edit email templates in `/app/api/contact/route.ts` and `/app/api/webhooks/stripe/route.ts`

Customize:
- From address
- Subject lines
- HTML content

## Building for Production

```bash
npm run build
npm start
```

Or deploy to Render (see README.md for instructions).

## Next Steps

1. ✅ Test all features locally
2. ✅ Customize branding and colors in `tailwind.config.ts`
3. ✅ Update contact info in footer (`components/Footer.tsx`)
4. ✅ Deploy to Render (see README.md)
5. ✅ Update Stripe webhook URL to production domain
6. ✅ Switch from Stripe test to live keys (optional, only when ready)
7. ✅ Set up custom domain (optional)
8. ✅ Monitor payments and subscriptions

## Support

- Next.js docs: https://nextjs.org/docs
- Stripe docs: https://stripe.com/docs
- Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://next-auth.js.org
