# Renewal System Documentation

Complete guide to the automatic renewal and email reminder system.

## Overview

When a customer purchases a "Site + Maintenance" plan:
1. They pay $150 one-time for the website
2. Their credit card is charged $50/month automatically for 30 days
3. You receive email reminders before and after charging
4. The admin dashboard shows upcoming renewals with a countdown

## How It Works

### Timeline for Each Client

**Day 1** - Customer purchases plan
- ✅ Payment processed
- 📧 Welcome email sent
- 📊 Client appears in admin dashboard
- ⏰ 30-day countdown starts

**Day 25** - Upcoming renewal reminder
- 📧 Email: "Your renewal is coming up in 5 days"
- 💡 Reminder to update contact info if needed

**Day 29** - Final reminder (24 hours before)
- 📧 Email: "Tomorrow we'll charge your card"
- ⚠️ Last chance to cancel or update

**Day 30** - Automatic renewal
- 💳 Stripe charges the card automatically
- 📧 Confirmation email with receipt
- 🔄 New 30-day cycle begins

## Setting Up the Cron Job

The renewal emails are sent automatically via a scheduled cron job. You need to set this up once.

### Option 1: Use Render (Easiest)

If you're hosting on Render:

1. Go to your Render service dashboard
2. Click "Settings" → "Cron Jobs"
3. Click "Create Cron Job"
4. Fill in:
   - **Name**: `send-renewal-emails`
   - **Schedule**: `0 9 * * *` (Daily at 9 AM)
   - **URL**: `https://your-app.onrender.com/api/cron/send-renewal-emails?token=YOUR_CRON_TOKEN`
5. Click "Create"

### Option 2: Use External Cron Service

Free options:
- **EasyCron.com** - Free tier available
- **cron-job.org** - Completely free
- **AWS EventBridge** - Free tier available

Steps:
1. Go to the service
2. Create new cron job
3. Set schedule to run daily (e.g., 9 AM)
4. URL: `https://yourdomain.com/api/cron/send-renewal-emails?token=YOUR_CRON_TOKEN`

### Option 3: Local Development Testing

To test the cron job locally:

```bash
# View what emails would be sent
curl "http://localhost:3000/api/cron/send-renewal-emails?token=YOUR_CRON_TOKEN"

# Actually send the emails
curl -X POST "http://localhost:3000/api/cron/send-renewal-emails?token=YOUR_CRON_TOKEN"
```

## Admin Dashboard Features

### Upcoming Renewals Section

At the top of the admin dashboard, you'll see a red "Upcoming Renewals (Next 7 Days)" section showing:

- **Client Name** - Who needs to be charged
- **Email** - Their contact email
- **Renewal Date** - When they'll be charged
- **Countdown** - How many days remaining
  - 🔴 Red: 0-3 days (urgent)
  - 🟡 Yellow: 4-7 days (coming soon)
- **Amount** - $50 per month
- **Site** - Click to visit their website (if set)

### Color Coding

- **Today** - Red with number 0
- **Tomorrow** - Red with "Tomorrow"
- **3 days or less** - Red text
- **4-7 days** - Yellow text
- **Beyond 7 days** - Not shown (but shows in full subscriptions list)

## Managing Site URLs

### Setting the Site URL

When you first build the site, add its URL to the client profile:

1. Go to `/admin/clients`
2. Click "Edit" on the client's row
3. Enter the "Website URL" (e.g., `https://example.com`)
4. Click "Save Changes"

### Why Site URLs Matter

- Shown in admin dashboard for quick access
- Displayed in reminder emails to customers
- Helps you keep track of what you've built for them

## Email Templates

### 1. Welcome Email (Day 1)

Sent immediately after purchase.

**Content:**
- Thank you message
- What happens next
- What's included in their plan
- Mention of upcoming site details

### 2. Upcoming Renewal Email (Day 25)

Sent 5 days before renewal.

**Content:**
- Renewal details (date, amount)
- Link to their website
- What's included in maintenance
- How to update billing info

### 3. Final Reminder (Day 29)

Sent 24 hours before renewal.

**Content:**
- Urgent reminder (last chance)
- Exact amount being charged
- What for (site maintenance)
- Contact info to cancel

### 4. Renewal Processed (Day 30)

Sent when charge completes.

**Content:**
- Confirmation that charge succeeded
- Receipt with amount and date
- What's included for next 30 days
- Thank you message

### 5. Renewal Processed (Day 30 - Invoice)

(Optional) Your Stripe account sends an invoice automatically.

## Customizing Emails

To change email templates, edit `/lib/emails.ts`:

```typescript
export async function sendWelcomeEmail(data: EmailData) {
  // Modify the HTML content here
  const htmlContent = `
    <h2>Your custom subject</h2>
    <p>Your custom message</p>
  `;
  // ...
}
```

## Handling Failed Renewals

If a card is declined:

1. Stripe automatically retries for several days
2. Customer receives notifications from Stripe
3. Update payment method in their Stripe portal
4. Subscription status changes to `past_due`
5. Eventually suspends if not fixed

You can see failed renewals by checking subscription status in `/admin/subscriptions`.

## Manual Renewal Triggers

### View What Emails Will Be Sent

```bash
curl "https://yourdomain.com/api/cron/send-renewal-emails?token=YOUR_CRON_TOKEN"
```

This shows all upcoming renewals without sending emails.

### Send All Renewal Emails Now

```bash
curl -X POST "https://yourdomain.com/api/cron/send-renewal-emails?token=YOUR_CRON_TOKEN"
```

This sends renewal emails for clients whose renewal date matches:
- Day 25: "Upcoming renewal" email
- Day 1: "Final reminder" email
- Day 0: "Renewal processed" email

## Troubleshooting

### "Unauthorized" Error

✗ The `CRON_SECRET_TOKEN` doesn't match.

**Fix:**
1. Check your `.env.local` for `CRON_SECRET_TOKEN`
2. Copy the exact value
3. Paste it in the URL after `token=`

### Emails Not Sending

✗ SMTP configuration issue.

**Check:**
1. `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` in `.env.local`
2. For Gmail: Make sure you're using App Password, not account password
3. Check email logs in `/lib/emails.ts` - errors are logged

### Renewal Dates Not Showing

✗ Subscriptions not created properly.

**Check:**
1. Go to `/admin/subscriptions`
2. Verify subscription exists and status is "active"
3. Check `nextBillingDate` is populated
4. For "maintenance" tier clients only

### Countdown Shows Wrong Days

✗ Timezone issue.

The countdown calculation uses the client's system timezone. If it seems off:
1. Check client's timezone setting (if you add one later)
2. Or add a timezone offset to the calculation in `/lib/renewals.ts`

## Security Notes

1. **CRON_SECRET_TOKEN** - Keep this secret! Don't share in URLs or commit to git.
2. **Email delivery** - No email is resent if already delivered.
3. **Client data** - Never shown in logs or error messages.
4. **Authentication** - All admin endpoints require session authentication.

## Future Enhancements

Consider adding:
- [ ] SMS reminders in addition to email
- [ ] Client portal where they can manage renewal date
- [ ] Automatic invoice generation
- [ ] Renewal cost customization per client
- [ ] Email templates customization UI
- [ ] Renewal history/analytics
- [ ] Failed renewal notifications to you

## Support

For issues with renewal system:
1. Check `IMPLEMENTATION_LOG.md`
2. Review email logs in browser console
3. Test with POST request to cron endpoint
4. Check Stripe dashboard for subscription status
