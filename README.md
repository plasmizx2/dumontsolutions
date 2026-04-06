# Web Development Agency Site

A professional website for a web development agency with Stripe payment integration, admin dashboard, and client management.

## Features

- **Landing Page** - Professional hero section with services overview
- **Pricing Page** - Three pricing tiers with feature comparison
- **Contact Form** - Client inquiries with email notifications
- **Admin Dashboard** - Secure admin portal with:
  - Revenue and subscription tracking
  - Client management (CRUD operations)
  - Payment history
  - Subscription management
- **Stripe Integration** - One-time and recurring payments
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15+ with TypeScript and React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Email**: Nodemailer

## Prerequisites

- Node.js 22+
- npm or yarn
- PostgreSQL database (local or remote)
- Stripe account (https://stripe.com)
- SMTP service for emails (Gmail, SendGrid, etc.)

## Installation

### 1. Clone and Install Dependencies

```bash
cd agency-site
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Required environment variables:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/agency_site"

# Stripe (get from Stripe dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here (generate with: openssl rand -base64 32)

# Email (example: Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use App Password if using Gmail
SMTP_FROM=noreply@yoursite.com

# Admin
ADMIN_EMAIL=admin@yoursite.com
```

### 3. Set Up Database

```bash
# Push schema to database
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 4. Create Admin User

```bash
npx ts-node scripts/create-admin.ts
```

Or manually create one using Prisma Studio:

```bash
npx prisma studio
```

Add a user record to the `User` table with:
- `email`: your admin email
- `passwordHash`: bcrypt hash of your password (generate with `bcrypt.hashSync("password", 10)`)
- `isAdmin`: `true`

## Development

### Start Dev Server

```bash
npm run dev
```

Visit http://localhost:3000

### Admin Portal

- Login: http://localhost:3000/admin/login
- Dashboard: http://localhost:3000/admin

## Stripe Setup

### 1. Create Products

In the Stripe Dashboard:

1. **Basic Site Product**
   - Name: "Basic Site"
   - Price: $225 (one-time)

2. **Site Package Product**
   - Name: "Site Package"
   - Price: $225 (one-time)

3. **Maintenance Price**
   - Name: "Monthly Maintenance"
   - Price: $60 (recurring, monthly)

### 2. Set Up Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add Endpoint"
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Events to listen:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copy the Webhook Secret and add to `.env.local`

### 3. Testing with Stripe CLI

```bash
# Install Stripe CLI (https://stripe.com/docs/stripe-cli)

# Login to Stripe
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Use test card: 4242 4242 4242 4242
```

## Pricing Plans

1. **Basic Site** - $225 one-time
   - Professional website design
   - Fully responsive layout
   - Up to 5 pages
   - Contact form & SEO optimization

2. **Site + Maintenance** - $225 one-time + $60/month
   - Everything in Basic Site
   - Monthly maintenance & updates
   - Security patches & backups
   - Priority support

3. **Multi-Site + Maintenance** - $225/site one-time + $60/month
   - Everything above
   - Manage multiple websites
   - Centralized dashboard
   - Dedicated account manager

## Project Structure

```
agency-site/
├── app/
│   ├── api/
│   │   ├── admin/          # Admin API endpoints
│   │   ├── auth/           # NextAuth configuration
│   │   ├── checkout/       # Stripe checkout
│   │   ├── contact/        # Contact form
│   │   └── webhooks/       # Stripe webhooks
│   ├── admin/              # Admin dashboard pages
│   ├── contact/            # Contact page
│   ├── pricing/            # Pricing page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # React components
├── lib/                    # Utility functions & auth config
├── prisma/
│   └── schema.prisma       # Database schema
└── public/                 # Static assets
```

## API Endpoints

### Public Endpoints

- `POST /api/contact` - Submit contact form
- `POST /api/checkout` - Create Stripe checkout session

### Admin Endpoints (Protected)

- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/clients` - List clients
- `POST /api/admin/clients` - Create client
- `GET /api/admin/subscriptions` - List subscriptions
- `GET /api/admin/payments` - List payments

### Webhooks

- `POST /api/webhooks/stripe` - Stripe events

## Deployment to Render

### 1. Create Render Account

https://render.com

### 2. Create PostgreSQL Database

1. New → PostgreSQL
2. Create new database
3. Copy the external connection string

### 3. Deploy Web Service

1. New → Web Service
2. Connect GitHub repository
3. Environment: Node
4. Build command: `npm install && npx prisma migrate deploy && npm run build`
5. Start command: `npm start`
6. Add Environment Variables:
   - `DATABASE_URL` - From PostgreSQL service
   - `STRIPE_SECRET_KEY` - From Stripe
   - `STRIPE_WEBHOOK_SECRET` - From Stripe
   - `NEXTAUTH_URL` - Your Render domain
   - `NEXTAUTH_SECRET` - Generate new one
   - `SMTP_*` - Email configuration

### 4. Configure Stripe Webhook

Update Stripe webhook URL to: `https://your-render-app.onrender.com/api/webhooks/stripe`

## Testing Checklist

- [ ] Landing page loads correctly
- [ ] Pricing page displays all plans
- [ ] Contact form submits and sends email
- [ ] Admin login works
- [ ] Admin dashboard shows stats
- [ ] Can create/view/edit clients
- [ ] Stripe checkout flow completes
- [ ] Payment appears in admin dashboard
- [ ] Subscription webhook processed correctly
- [ ] Contact confirmation emails received

## Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL in .env.local
# Make sure PostgreSQL is running
# Verify credentials
npx prisma db push
```

### Stripe Webhook Not Working
```bash
# Check webhook secret in .env.local
# Verify endpoint URL in Stripe dashboard
# Use Stripe CLI to test: stripe trigger checkout.session.completed
```

### Email Not Sending
```bash
# Check SMTP credentials in .env.local
# For Gmail: use App Password, not account password
# Verify SMTP_FROM matches sender email
```

## Next Steps / Future Enhancements

- [ ] Client portal for project tracking
- [ ] Invoice generation and PDF downloads
- [ ] SMS notifications
- [ ] Custom domain setup wizard
- [ ] Analytics and reporting
- [ ] Team management
- [ ] API documentation

## Support

For issues or questions, contact: contact@yoursite.com

## License

MIT
