import nodemailer from "nodemailer";
import { formatBillingDate } from "./renewals";

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailData {
  clientName: string;
  email: string;
  billingDate: Date;
  amount: number; // in cents
  siteUrl?: string;
}

/**
 * Email 1: Day 1 after purchase - Welcome email
 */
export async function sendWelcomeEmail(data: EmailData) {
  const { clientName, email } = data;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Welcome! Your Website Project Starts Now",
      html: `
        <h2>Welcome, ${clientName}! 🎉</h2>
        <p>Thank you for choosing us to build your website!</p>
        <p>Your project is now in progress. Here's what happens next:</p>
        <ul>
          <li>We'll design and develop your custom website</li>
          <li>You'll receive updates throughout the process</li>
          <li>We'll launch your site within 30 days</li>
          <li>Monthly maintenance and support will keep it secure and updated</li>
        </ul>
        <p><strong>What's included in your plan:</strong></p>
        <ul>
          <li>Professional website design</li>
          <li>Mobile-responsive layout</li>
          <li>Monthly maintenance and updates</li>
          <li>Security patches and backups</li>
          <li>Priority email support</li>
        </ul>
        <br/>
        <p><strong>Cancel Anytime. Keep Your Code.</strong></p>
        <p>If you ever need to cancel, you own your code. We'll deliver it to you via GitHub or physical drive. No surprises, no complications.</p>
        <p>Manage or cancel your subscription at any time by visiting: <a href="${process.env.NEXTAUTH_URL}/cancel">${process.env.NEXTAUTH_URL}/cancel</a></p>
        <p>We'll be in touch soon with your site details!</p>
        <p>Best regards,<br>The Web Dev Team</p>
      `,
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error);
  }
}

/**
 * Email 2: Day 25 - Upcoming renewal reminder
 */
export async function sendUpcomingRenewalEmail(data: EmailData) {
  const { clientName, email, billingDate, amount, siteUrl } = data;
  const formattedDate = formatBillingDate(billingDate);
  const amountStr = (amount / 100).toFixed(2);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Renewal Reminder: Your Site Maintenance Renews on ${formattedDate}`,
      html: `
        <h2>Site Maintenance Renewal Coming Soon</h2>
        <p>Hi ${clientName},</p>
        <p>This is a friendly reminder that your monthly site maintenance and support renewal is coming up!</p>
        <p><strong>Renewal Details:</strong></p>
        <ul>
          <li><strong>Renewal Date:</strong> ${formattedDate}</li>
          <li><strong>Amount:</strong> $${amountStr}</li>
          <li><strong>Frequency:</strong> Monthly</li>
        </ul>
        ${siteUrl ? `<p><strong>Your Site:</strong> <a href="${siteUrl}">${siteUrl}</a></p>` : ""}
        <p><strong>What's included:</strong></p>
        <ul>
          <li>Monthly maintenance and updates</li>
          <li>Security patches</li>
          <li>Performance optimization</li>
          <li>Regular backups</li>
          <li>Priority support</li>
        </ul>
        <p>Your card will be charged automatically on the renewal date. If you need to update your billing information, please contact us.</p>
        <p>Thank you for your continued business!</p>
        <p>Best regards,<br>The Web Dev Team</p>
      `,
    });
    console.log(`✅ Upcoming renewal email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send upcoming renewal email to ${email}:`, error);
  }
}

/**
 * Email 3: Day 29 - Final renewal reminder (24 hours before)
 */
export async function sendFinalRenewalReminder(data: EmailData) {
  const { clientName, email, amount } = data;
  const amountStr = (amount / 100).toFixed(2);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Last Reminder: Your Site Renewal Charges Tomorrow",
      html: `
        <h2>Site Renewal Tomorrow ⏰</h2>
        <p>Hi ${clientName},</p>
        <p>This is your final reminder before we charge your card for your monthly site maintenance.</p>
        <p><strong>Charge Details:</strong></p>
        <ul>
          <li><strong>Amount:</strong> $${amountStr}</li>
          <li><strong>When:</strong> Tomorrow</li>
          <li><strong>What for:</strong> Monthly site maintenance & support</li>
        </ul>
        <p>If you need to cancel or update your plan, please reply to this email immediately.</p>
        <p>Thank you!</p>
        <p>Best regards,<br>The Web Dev Team</p>
      `,
    });
    console.log(`✅ Final renewal reminder sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send final reminder to ${email}:`, error);
  }
}

/**
 * Email 4: Day 30 - Renewal processed confirmation
 */
export async function sendRenewalProcessedEmail(data: EmailData) {
  const { clientName, email, amount, siteUrl } = data;
  const amountStr = (amount / 100).toFixed(2);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Your Site Renewal Has Been Processed ✅",
      html: `
        <h2>Renewal Processed Successfully</h2>
        <p>Hi ${clientName},</p>
        <p>Your monthly site maintenance renewal has been processed successfully!</p>
        <p><strong>Receipt Details:</strong></p>
        <ul>
          <li><strong>Amount Charged:</strong> $${amountStr}</li>
          <li><strong>Service:</strong> Monthly Site Maintenance & Support</li>
          <li><strong>Next Renewal:</strong> In 30 days</li>
        </ul>
        ${siteUrl ? `<p><strong>Your Site:</strong> <a href="${siteUrl}">${siteUrl}</a></p>` : ""}
        <p><strong>Your services now include:</strong></p>
        <ul>
          <li>✅ Monthly maintenance and updates</li>
          <li>✅ Security patches and monitoring</li>
          <li>✅ Performance optimization</li>
          <li>✅ Regular backups</li>
          <li>✅ Priority email support for the next 30 days</li>
        </ul>
        <br/>
        <p><strong>Cancel Anytime. Keep Your Code.</strong></p>
        <p>If you ever need to cancel, you own your code. We'll deliver it to you via GitHub or physical drive.</p>
        <p>Manage or cancel your subscription at: <a href="${process.env.NEXTAUTH_URL}/cancel">${process.env.NEXTAUTH_URL}/cancel</a></p>
        <p>Thank you for your continued trust in us!</p>
        <p>Best regards,<br>The Web Dev Team</p>
      `,
    });
    console.log(`✅ Renewal processed email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send renewal processed email to ${email}:`, error);
  }
}

/**
 * Email: Subscription Canceled (Customer)
 */
export async function sendCancellationConfirmationEmail(data: {
  clientName: string;
  email: string;
  codeDeliveryMethod: "github" | "thumbdrive";
  githubRepoUrl?: string;
}) {
  const { clientName, email, codeDeliveryMethod, githubRepoUrl } = data;

  try {
    let deliveryInfo = "";
    if (codeDeliveryMethod === "github" && githubRepoUrl) {
      deliveryInfo = `
        <p><strong>Your GitHub Repository:</strong></p>
        <p><a href="${githubRepoUrl}">${githubRepoUrl}</a></p>
        <p>Accept the invitation to access your code. You now own this repository permanently.</p>
      `;
    } else if (codeDeliveryMethod === "thumbdrive") {
      deliveryInfo = `
        <p><strong>Code Delivery Method: Physical Thumb Drive</strong></p>
        <p>We'll prepare your complete website code and ship it to you via USPS.</p>
        <p>Estimated delivery: 5-7 business days</p>
        <p>You'll receive a tracking number via email once shipped.</p>
      `;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Your Subscription Has Been Canceled ✓",
      html: `
        <h2>Subscription Canceled</h2>
        <p>Hi ${clientName},</p>
        <p>Your monthly subscription has been successfully canceled.</p>
        <p><strong>✓ No further charges will be made to your card.</strong></p>

        <h3>Your Website Code</h3>
        <p>You now own your website code! It will be delivered to you via:</p>
        ${deliveryInfo}

        <h3>What Happens Next?</h3>
        <ul>
          <li>We'll prepare your complete website code and assets</li>
          <li>${codeDeliveryMethod === "github" ? "Accept your GitHub repo invitation" : "Receive your code via USPS"}
          <li>You have full ownership and can use it however you like</li>
        </ul>

        <p><strong>Questions?</strong> Reply to this email and we'll help!</p>
        <p>Thank you for working with us!</p>
        <p>Best regards,<br>The Web Dev Team</p>
      `,
    });
    console.log(`✅ Cancellation confirmation sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send cancellation email to ${email}:`, error);
  }
}

/**
 * Email: Cancellation Alert (Admin - Immediate)
 */
export async function sendCancellationAlertEmail(data: {
  clientName: string;
  email: string;
  codeDeliveryMethod: string;
}) {
  const { clientName, email, codeDeliveryMethod } = data;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error("ADMIN_EMAIL not configured");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: adminEmail,
      subject: `🔴 URGENT: Subscription Cancellation from ${clientName}`,
      html: `
        <h2 style="color: red;">🔴 SUBSCRIPTION CANCELED</h2>
        <p><strong>ACTION REQUIRED!</strong></p>

        <h3>Client Details</h3>
        <ul>
          <li><strong>Name:</strong> ${clientName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Time:</strong> Just now</li>
        </ul>

        <h3>Code Delivery Method</h3>
        <p><strong>${codeDeliveryMethod === "github" ? "🖥️ GitHub Repository" : "💾 Physical Thumb Drive"}</strong></p>
        ${
          codeDeliveryMethod === "github"
            ? `<p>Send them the GitHub repo link with their code</p>`
            : `<p>Prepare their code on a thumb drive and ship it</p>`
        }

        <h3>Next Steps</h3>
        <ol>
          <li>Prepare their website code and assets</li>
          <li>If GitHub: Create private repo → Send repo URL</li>
          <li>If Thumb Drive: Burn code to USB → Ship via USPS</li>
          <li>Send them the code delivery details</li>
          <li>Mark as "sent" in admin dashboard</li>
        </ol>

        <p style="color: red; font-weight: bold;">⚠️ You have 7 days to deliver the code!</p>

        <p><a href="${process.env.NEXTAUTH_URL}/admin/subscriptions" style="background: red; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Cancellations Dashboard</a></p>
      `,
    });
    console.log(`✅ Cancellation alert sent to ${adminEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send cancellation alert:`, error);
  }
}

/**
 * Email: Cancellation Reminder (Admin - Day 1, 3, 7)
 */
export async function sendCancellationReminderEmail(data: {
  clientName: string;
  email: string;
  codeDeliveryMethod: string;
  daysSinceCancellation: number;
}) {
  const { clientName, email, codeDeliveryMethod, daysSinceCancellation } = data;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error("ADMIN_EMAIL not configured");
    return;
  }

  let urgency = "⚠️";
  let subject = `Reminder: Code delivery needed`;

  if (daysSinceCancellation >= 7) {
    urgency = "🔴 URGENT";
    subject = `🔴 OVERDUE: Cancellation code delivery is overdue!`;
  } else if (daysSinceCancellation >= 3) {
    urgency = "🟡 HIGH";
    subject = `High Priority: Code delivery due in ${7 - daysSinceCancellation} days`;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: adminEmail,
      subject: subject,
      html: `
        <h2>${urgency} Code Delivery Reminder</h2>

        <p><strong>This cancellation is ${daysSinceCancellation} days old and needs action!</strong></p>

        <h3>Client Details</h3>
        <ul>
          <li><strong>Name:</strong> ${clientName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Days since cancellation:</strong> ${daysSinceCancellation}/7</li>
        </ul>

        <h3>Code Delivery Method</h3>
        <p><strong>${codeDeliveryMethod === "github" ? "🖥️ GitHub Repository" : "💾 Physical Thumb Drive"}</strong></p>

        <h3>Status Check</h3>
        <p>Have you sent them their code yet?</p>
        <ul>
          <li>[ ] Prepared their website code and assets</li>
          <li>[ ] Created GitHub repo or burned thumb drive</li>
          <li>[ ] Sent delivery details to them</li>
          <li>[ ] Marked as "sent" in admin dashboard</li>
        </ul>

        ${
          daysSinceCancellation >= 7
            ? `<p style="color: red; font-weight: bold;">This is now OVERDUE. Customer may complain. Fulfill immediately!</p>`
            : `<p>Complete by: ${new Date(Date.now() + (7 - daysSinceCancellation) * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>`
        }

        <p><a href="${process.env.NEXTAUTH_URL}/admin/subscriptions" style="background: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a></p>
      `,
    });
    console.log(`✅ Cancellation reminder sent to ${adminEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send cancellation reminder:`, error);
  }
}

/**
 * Generic email sender utility
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}
