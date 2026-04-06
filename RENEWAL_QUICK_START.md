# Renewal System - Quick Start Guide

Everything is already built! Here's what you need to do to use it.

## 1️⃣ Set Up Environment Variable

Add to `.env.local`:

```env
CRON_SECRET_TOKEN=generate-with-openssl-rand-base64-32
```

Generate token:
```bash
openssl rand -base64 32
```

## 2️⃣ Set Up Daily Email Cron Job

**Choose ONE option below:**

### Option A: Render (Easiest - if deploying there)

1. Go to your Render dashboard
2. Click your service → Settings → Cron Jobs
3. Create new cron job:
   - **Name**: `send-renewal-emails`
   - **Schedule**: `0 9 * * *` (Daily 9 AM)
   - **URL**: `https://your-app.onrender.com/api/cron/send-renewal-emails?token=YOUR_CRON_TOKEN`

### Option B: Free External Service

Use **cron-job.org** or **EasyCron.com**:
1. Create account
2. New cron job
3. Schedule: Daily 9 AM
4. URL: `https://yourdomain.com/api/cron/send-renewal-emails?token=YOUR_CRON_TOKEN`

### Option C: Test Locally First

Before setting up cron, test it:

```bash
# View renewals (doesn't send emails)
curl "http://localhost:3000/api/cron/send-renewal-emails?token=YOUR_CRON_TOKEN"

# Send renewal emails (actually sends!)
curl -X POST "http://localhost:3000/api/cron/send-renewal-emails?token=YOUR_CRON_TOKEN"
```

## 3️⃣ When Customer Purchases

✅ Automatically happens:
- Payment processed
- Welcome email sent
- Client saved in database
- Subscription created (if Site + Maintenance plan)
- 30-day countdown starts

## 4️⃣ After You Build Their Site

1. Go to `/admin/clients`
2. Click "Edit" on their row
3. Enter their **Website URL** (e.g., `https://example.com`)
4. Click "Save Changes"

That's it! Their site link now appears everywhere.

## 5️⃣ Monitor Renewals on Dashboard

Go to `/admin`:

See **"Upcoming Renewals"** section at the top:
- 🔴 Red = Today or in next 3 days (urgent!)
- 🟡 Yellow = 4-7 days away
- Shows countdown, amount, and their site link

## 6️⃣ Email Schedule (Automatic)

Once cron job is set up, emails send automatically:

- **Day 1**: "Welcome! We're building your site" email
- **Day 25**: "Your renewal is in 5 days" reminder
- **Day 29**: "Tomorrow we charge your card" final warning
- **Day 30**: "Renewal complete! Here's your receipt"

## Example Timeline

**Monday**: Customer buys Site + Maintenance for $225 + $60/month
- Welcome email sent
- Client appears in admin with 30-day countdown

**Friday (Day 25)**: Automatic reminder email
- "Your renewal charges in 5 days on Monday"

**Sunday (Day 29)**: Final warning email
- "Tomorrow we'll charge your card $60"

**Monday (Day 30)**: Auto-renewal happens
- Card charged $60
- Confirmation email sent
- Dashboard shows new 30-day countdown

**Repeat** every 30 days

## Quick Commands

```bash
# Test emails (shows what would send, doesn't actually send)
curl "https://yourdomain.com/api/cron/send-renewal-emails?token=YOUR_TOKEN"

# Actually send renewal emails
curl -X POST "https://yourdomain.com/api/cron/send-renewal-emails?token=YOUR_TOKEN"

# Check specific client's renewal date
# Go to /admin/subscriptions and look for them
```

## What Shows Where

### Admin Dashboard (`/admin`)
✅ Upcoming renewals (next 7 days)
✅ Countdown timer
✅ Total revenue
✅ Active subscriptions
✅ Recent orders

### Clients Page (`/admin/clients`)
✅ List of all clients
✅ Their site URL (if set)
✅ Pricing plan
✅ Sign-up date

### Subscriptions Page (`/admin/subscriptions`)
✅ All active subscriptions
✅ Renewal dates
✅ Monthly amounts
✅ Status (active/canceled/past_due)

### Edit Client (`/admin/clients/[id]`)
✅ Name, email, phone
✅ Company info
✅ **Website URL** ← Add after building their site
✅ Pricing plan (read-only)

## Email Customization

To change what emails say, edit `/lib/emails.ts`:

```typescript
// Find the email function you want to change
// E.g., sendWelcomeEmail, sendUpcomingRenewalEmail, etc.
// Edit the HTML content inside

const htmlContent = `
  <h2>Your custom subject</h2>
  <p>Your custom message</p>
`;
```

## Troubleshooting

### Cron job not running?
- Check token matches exactly
- Try POST instead of GET
- Check email logs in code

### Emails not sending?
- Verify SMTP config in `.env.local`
- For Gmail: Use App Password, not account password
- Check email address is correct

### Renewal dates wrong?
- Verify subscription was created after purchase
- Check `/admin/subscriptions` page
- Verify `nextBillingDate` is populated

### Site URL not showing?
- Make sure you clicked "Save Changes" after editing
- Try refreshing the page
- Check database with `npx prisma studio`

## Important Notes

📌 **Cron Token** - Keep it secret! Don't commit to git.

📌 **SMTP Setup** - This is what sends emails. Must be configured in `.env.local`

📌 **Stripe Subscriptions** - Automatically created on purchase. You don't need to manage them.

📌 **Manual Charges** - Not needed! Stripe handles recurring charges automatically.

## Next Steps

1. ✅ Update `.env.local` with `CRON_SECRET_TOKEN`
2. ✅ Set up cron job (Render or external service)
3. ✅ Test with test purchase (`4242 4242 4242 4242`)
4. ✅ Go to `/admin/clients` and add their site URL when ready
5. ✅ Watch emails send automatically!

---

**Everything is set up. Just add the site URLs as you build sites, and the renewal system handles the rest!** 🎉
