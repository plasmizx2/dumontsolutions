# Subscription Cancellation System

Complete guide to subscription cancellations with code delivery and admin notifications.

## How It Works

### Customer Cancels Subscription

1. Customer navigates to cancellation portal
2. Confirms they want to cancel
3. Selects code delivery method:
   - 🖥️ **GitHub** - They get a private repo link
   - 💾 **Thumb Drive** - They'll receive physical drive in mail
4. Submits cancellation
5. Receives confirmation email

### Immediately After Cancellation

✅ **Stripe Subscription Stops**
- Recurring charge stops immediately
- Card will NOT be charged again
- Subscription status changes to "canceled"

✅ **Customer Gets Confirmation Email**
- Thanks them for the business
- Explains code delivery method
- Next steps for accessing their code

✅ **Admin Gets IMMEDIATE Notification** (Email 1)
- Client name and email
- Code delivery method selected
- Instructions for fulfillment

### First Follow-up (Admin)

📧 **Day 1 Email** - Reminder to fulfill
- Urgent: Code delivery needed
- Client info and method
- Checklist for fulfillment

📧 **Day 3 Email** - Second reminder
- "Have you sent the code yet?"
- Client details
- Escalation warning

📧 **Day 7 Email** - Final reminder
- "This cancellation is 1 week old"
- Must be fulfilled ASAP
- Risk of customer complaint

## Database Schema Updates

New fields added to `Subscription` model:

```prisma
status: "active" | "canceled" | "past_due" | "unpaid"
canceledAt: DateTime?           // When they canceled
codeDeliveryMethod: "github" | "thumbdrive"?  // How to deliver
codeDeliveryStatus: "pending" | "sent" | "delivered"?
codeDeliveryDate: DateTime?     // When sent
notes: String?                  // Notes about cancellation
```

## Files Created/Updated

### New Files
- `/app/api/subscriptions/cancel/route.ts` - Cancel subscription endpoint
- `/app/api/cron/send-cancellation-notifications/route.ts` - Send admin reminders
- `/lib/cancellation.ts` - Utility functions for cancellations

### Updated Files
- `prisma/schema.prisma` - Added cancellation fields
- `app/api/webhooks/stripe/route.ts` - Handle Stripe cancellation
- Database migration for new fields

## API Endpoints

### Cancel Subscription (Customer)
```
POST /api/subscriptions/cancel
Body: {
  subscriptionId: number,
  codeDeliveryMethod: "github" | "thumbdrive",
  reason?: string
}
```

### Get Cancellation Status (Admin)
```
GET /api/admin/cancellations
```

### Update Code Delivery Status (Admin)
```
PUT /api/admin/cancellations/[id]
Body: {
  status: "sent" | "delivered",
  notes?: string,
  deliveryDate?: ISO8601
}
```

### Send Cancellation Notifications (Cron)
```
POST /api/cron/send-cancellation-notifications?token=CRON_TOKEN
```

## Email Notifications

### Customer Receives
1. **Cancellation Confirmed** (immediate)
   - Thanks them
   - Confirms cancellation
   - Explains code delivery
   - Says goodbye

### Admin Receives (Multiple)
1. **URGENT: Cancellation Received** (immediate)
   - Client name/email
   - Code delivery method
   - Action required by [DATE]

2. **Day 1 Reminder** (automatic)
   - "Cancellation from X days ago"
   - Code delivery checklist
   - Mark as sent when done

3. **Day 3 Reminder** (automatic)
   - Second reminder
   - "Have you fulfilled this?"
   - Link to mark as completed

4. **Day 7 Reminder** (automatic)
   - Final warning
   - "This is overdue!"
   - Risk of customer complaint

## Customer Cancellation Flow

### Option 1: Self-Service Portal
Customer can cancel themselves:
1. Login to customer portal (future feature)
2. Select "Manage Subscription"
3. Click "Cancel Subscription"
4. Choose delivery method
5. Confirm and submit

### Option 2: Admin-Initiated
Admin cancels on their behalf:
1. Go to `/admin/subscriptions`
2. Click subscription
3. Click "Cancel"
4. Select delivery method
5. Submit
6. System sends cancellation confirmation to customer

## Code Delivery Methods

### GitHub
✅ **How it works:**
1. You create a private GitHub repo with their code
2. Admin enters the repo URL
3. System sends link to customer
4. They accept invitation
5. Mark as "delivered"

**Pros:**
- Fast - instant access
- No shipping delay
- Can provide lifetime access
- Easy to update later

**Cons:**
- Customer needs GitHub account

### Thumb Drive
✅ **How it works:**
1. Customer cancels and selects "Thumb Drive"
2. You burn code to USB drive
3. Ship via USPS/UPS
4. Customer receives
5. Admin marks as "delivered"

**Pros:**
- Physical backup
- Don't need tech skills
- Professional delivery

**Cons:**
- Takes time to ship
- Costs for drive + shipping
- Delivery delays

## Setup Instructions

### 1. Update .env.local

```env
# Cancellation system
CANCELLATION_NOTIFICATION_DAYS=1,3,7  # When to send reminders
```

### 2. Set Up Cron Job for Reminders

Same as renewal emails - daily schedule:

```
POST /api/cron/send-cancellation-notifications?token=CRON_TOKEN
```

**Render:** Settings → Cron Jobs
- Schedule: `0 10 * * *` (10 AM daily)
- URL: `https://your-app.onrender.com/api/cron/send-cancellation-notifications?token=YOUR_TOKEN`

### 3. Database Migration

```bash
npx prisma migrate dev --name add_cancellation_fields
```

## Admin Workflow

### When Customer Cancels

1. **Email alert arrives** (automatic)
2. **Go to `/admin/cancellations`**
3. **See list of cancellations needing action**
4. **Click cancellation to view details**
5. **Choose action:**
   - If GitHub: Enter repo URL → Click "Send Code"
   - If Thumb Drive: Check "Shipped" → Enter tracking → Click "Sent"
6. **When customer confirms they have code:** Mark as "Delivered"

### Cancellation Dashboard View

Shows:
- Client name
- Cancellation date
- Code delivery method
- Status: Pending / Sent / Delivered
- Days since cancellation (red if > 7)
- Notes field for tracking

## Stripe Integration

### What Happens Automatically

1. **Customer cancels** → API call
2. **Stripe subscription cancels** (no more charges)
3. **Customer gets email** with confirmation
4. **Admin gets email** with action items
5. **System tracks status** for follow-ups

### Failed Cancellations

If Stripe cancellation fails:
- Customer sees error
- System retries automatically
- Admin is notified
- Manual cancellation option available

## Multi-Notification Strategy

### Why Multiple Emails?

You're busy! This ensures code gets delivered:
- **Email 1 (Immediate)**: You see it right away
- **Email 2 (Day 1)**: Quick reminder before you forget
- **Email 3 (Day 3)**: "Hey, it's been a few days..."
- **Email 4 (Day 7)**: "This is now overdue!"

### Turning Off Reminders

In cron endpoint, set:
```
CANCELLATION_NOTIFICATION_DAYS=0
```

Or comment out the cron job in Render/external service.

## Customer Communication

### What Customer Sees

**Immediately:**
```
Subject: Your Subscription Has Been Canceled ✓

Hi [Name],

Your subscription has been successfully canceled.
No further charges will be made to your card.

You now own your website code and it will be
delivered via [GitHub / Thumb Drive].

Next steps:
- [GitHub] Check your email for the repo link
- [Thumb Drive] We'll ship it within 5 business days

Thank you for working with us!
```

### If They Selected GitHub

```
Your code repository is ready at:
https://github.com/yourusername/[client-code]

Accept the invitation to access your code.
This is your permanent backup.
```

### If They Selected Thumb Drive

```
We'll prepare your code and ship it via USPS.
You'll receive a tracking number via email.

Estimated delivery: 5-7 business days
```

## Troubleshooting

### Customer didn't cancel but email sent
- Check Stripe webhook logs
- Verify customer ID in request

### Stripe cancellation failed
- Check Stripe credentials
- Verify subscription exists
- Try manual cancellation from Stripe dashboard

### Reminder emails not sending
- Check cron job is running
- Verify CRON_SECRET_TOKEN matches
- Check SMTP config

### Can't mark as delivered
- Refresh page
- Check database directly with `npx prisma studio`
- Verify subscription exists and is "canceled"

## Security Notes

- Cancellations require authentication
- Email confirmations sent to verified address only
- Admin notifications only to ADMIN_EMAIL
- GitHub repos should be private
- No code exposed in emails or logs

## Future Enhancements

- [ ] Customer self-service portal
- [ ] Automatic GitHub repo creation
- [ ] Shipping label generation
- [ ] Tracking number integration
- [ ] Customer survey on cancellation
- [ ] Retention offer before cancellation
- [ ] Refund/proration for partial months
- [ ] Analytics on cancellation reasons
