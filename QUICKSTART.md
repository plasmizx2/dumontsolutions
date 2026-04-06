# Quick Start Guide

Your web development agency website is ready! Here's what to do next:

## 1️⃣ Install Dependencies

```bash
cd /Users/seandumont/Desktop/DumontDemos/agency-site
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm install
```

## 2️⃣ Configure Environment Variables

Open `.env.local` and update these values:

```
DATABASE_URL=postgresql://... # Your database connection
STRIPE_SECRET_KEY=sk_test_... # From Stripe dashboard
NEXTAUTH_SECRET=... # Generate: openssl rand -base64 32
SMTP_USER=... # Your Gmail address
SMTP_PASSWORD=... # Gmail App Password
ADMIN_EMAIL=... # Your admin email
```

See `SETUP.md` for detailed instructions.

## 3️⃣ Set Up Database

```bash
npx prisma migrate dev --name init
```

## 4️⃣ Create Admin User

```bash
npx ts-node scripts/create-admin.ts
```

## 5️⃣ Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 🚀

## 📍 Key Pages

- **Landing**: http://localhost:3000
- **Pricing**: http://localhost:3000/pricing
- **Contact**: http://localhost:3000/contact
- **Admin Login**: http://localhost:3000/admin/login
- **Admin Dashboard**: http://localhost:3000/admin

## 📂 Project Structure

```
agency-site/
├── app/
│   ├── page.tsx                 ← Landing page
│   ├── pricing/page.tsx         ← Pricing page
│   ├── contact/page.tsx         ← Contact form
│   ├── admin/                   ← Admin dashboard
│   ├── api/                     ← API routes
│   └── layout.tsx               ← Root layout
├── components/
│   ├── Navigation.tsx
│   └── Footer.tsx
├── prisma/
│   └── schema.prisma            ← Database schema
├── public/                      ← Static files
├── .env.local                   ← Environment variables (CREATE THIS!)
├── SETUP.md                     ← Detailed setup guide
└── README.md                    ← Full documentation
```

## 🛠️ Available Commands

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint

npx prisma studio    # Open database viewer
npx prisma migrate dev --name <name>  # Create migration
```

## 💳 Stripe Setup (Optional for now)

For testing payments locally:

1. Get API keys from https://dashboard.stripe.com/apikeys
2. Add to `.env.local`
3. Install Stripe CLI and run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Use test card: `4242 4242 4242 4242`

## 📧 Email Configuration

Using Gmail (recommended):
1. Enable 2-factor auth
2. Create App Password at https://myaccount.google.com/apppasswords
3. Use 16-char password in `.env.local`

## ✅ Customization

Before deploying, update:
- [ ] Site colors in `tailwind.config.ts`
- [ ] Company name in `components/Navigation.tsx`
- [ ] Contact info in `components/Footer.tsx`
- [ ] Pricing details in `app/pricing/page.tsx`
- [ ] Admin email in `.env.local`

## 🚀 Deploy to Render

When ready to go live:
1. See `README.md` for detailed Render deployment steps
2. Or follow the quick path: `npm run build && npm start`

## ❓ Issues?

- Check `SETUP.md` for troubleshooting
- Review `README.md` for API documentation
- Check terminal logs for error details

---

**You're all set! Happy coding! 🎉**
