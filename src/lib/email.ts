import { Resend } from "resend";
import { formatPaise } from "./money";
import { formatAddress, parseAddress } from "./orders";
import {
  STATUS_LABELS,
  STATUS_EMAIL_PHRASE,
  type OrderStatus,
} from "./orderStatus";

// ─────────────────────────────────────────────────────────────
// Transactional email via Resend.
// If RESEND_API_KEY is missing, emails are logged and skipped so the
// app keeps working in local dev. Templates share one doodly HTML
// layout (Caveat headings, coral accents).
// ─────────────────────────────────────────────────────────────

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "orders@samairastudio.com";
const CONTACT_NOTIFY_EMAIL =
  process.env.CONTACT_NOTIFY_EMAIL || "hello@samairastudio.com";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const emailConfigured = Boolean(RESEND_API_KEY);

let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) resend = new Resend(RESEND_API_KEY);
  return resend;
}

interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
}

async function send({ to, subject, html }: SendArgs) {
  if (!emailConfigured) {
    console.info(
      `[email] RESEND_API_KEY not set, skipping email "${subject}" to ${to}`
    );
    return { skipped: true as const };
  }
  try {
    const result = await getResend().emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    return { skipped: false as const, result };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { skipped: false as const, error: err };
  }
}

// ── Shared HTML layout ──────────────────────────────────────────
function layout(opts: { heading: string; bodyHtml: string }): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background:#FDFAF5;font-family:Inter,Arial,sans-serif;color:#1A1A1A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF5;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #efe9df;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <div style="font-family:'Caveat',cursive;font-size:30px;font-weight:700;color:#1A1A1A;">Samaira Studio <span style="color:#E07A5F;">✦</span></div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <div style="height:3px;width:120px;background:#E07A5F;border-radius:3px;opacity:.7;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 8px 32px;">
                <h1 style="font-family:'Caveat',cursive;font-size:32px;line-height:1.15;margin:0 0 8px 0;color:#1A1A1A;">${opts.heading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px 32px;font-size:15px;line-height:1.6;color:#333;">
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#FDFAF5;border-top:1px solid #efe9df;font-size:12px;color:#8a8378;">
                © Samaira Studio · made with care ✦<br />
                <a href="${BASE_URL}" style="color:#E07A5F;text-decoration:none;">${BASE_URL.replace(
                  /^https?:\/\//,
                  ""
                )}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#E07A5F;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">${label}</a>`;
}

interface EmailOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  address: string;
  total: number;
  subtotal: number;
  status: string;
  trackingNumber?: string | null;
  courierName?: string | null;
  estimatedDelivery?: Date | null;
  items: {
    productName: string;
    quantity: number;
    price: number;
  }[];
}

function itemRows(items: EmailOrder["items"]): string {
  return items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f1ece3;">${it.productName} <span style="color:#9a9384;">× ${it.quantity}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid #f1ece3;text-align:right;white-space:nowrap;">${formatPaise(
          it.price * it.quantity
        )}</td>
      </tr>`
    )
    .join("");
}

// ── 1. Order confirmed ─────────────────────────────────────────
export async function sendOrderConfirmation(order: EmailOrder) {
  const trackUrl = `${BASE_URL}/orders/${order.id}`;
  const address = formatAddress(parseAddress(order.address));
  const body = `
    <p>Hi ${order.customerName}, your order is in good hands. We are getting it ready ✦</p>
    <p style="margin:16px 0 6px 0;color:#8a8378;font-size:13px;">ORDER ID</p>
    <p style="margin:0 0 16px 0;font-weight:600;">${order.id}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${itemRows(order.items)}
      <tr>
        <td style="padding:12px 0 0 0;font-weight:600;">Total</td>
        <td style="padding:12px 0 0 0;text-align:right;font-weight:600;color:#E07A5F;">${formatPaise(
          order.total
        )}</td>
      </tr>
    </table>
    <p style="margin:20px 0 6px 0;color:#8a8378;font-size:13px;">DELIVERING TO</p>
    <p style="margin:0 0 24px 0;">${address}</p>
    ${button(trackUrl, "Track your order →")}
  `;
  return send({
    to: order.customerEmail,
    subject: "Your Samaira Studio order is confirmed! ✦",
    html: layout({ heading: "Order confirmed!", bodyHtml: body }),
  });
}

// ── 2. Order status update ─────────────────────────────────────
export async function sendStatusUpdate(order: EmailOrder) {
  const status = order.status as OrderStatus;
  const trackUrl = `${BASE_URL}/orders/${order.id}`;
  const label = STATUS_LABELS[status] ?? order.status;

  let extra = "";
  if (status === "SHIPPED" && (order.trackingNumber || order.courierName)) {
    extra = `
      <div style="margin:16px 0;padding:14px 16px;background:#FDFAF5;border:1px solid #efe9df;border-radius:12px;">
        ${order.courierName ? `<div><strong>Courier:</strong> ${order.courierName}</div>` : ""}
        ${order.trackingNumber ? `<div><strong>Tracking #:</strong> ${order.trackingNumber}</div>` : ""}
        ${
          order.estimatedDelivery
            ? `<div><strong>Est. delivery:</strong> ${new Date(
                order.estimatedDelivery
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}</div>`
            : ""
        }
      </div>`;
  }

  const body = `
    <p>Hi ${order.customerName}, there is an update on your order.</p>
    <p style="margin:16px 0;">Your order <strong>${order.id}</strong> is now
      <span style="display:inline-block;background:#E07A5F;color:#fff;font-size:13px;font-weight:600;padding:3px 12px;border-radius:999px;">${label}</span>
    </p>
    ${extra}
    ${button(trackUrl, "View order status →")}
  `;
  return send({
    to: order.customerEmail,
    subject: `Your order has been ${STATUS_EMAIL_PHRASE[status] ?? "updated"}`,
    html: layout({ heading: `Order ${label.toLowerCase()} ✦`, bodyHtml: body }),
  });
}

// ── 3. Contact / work-with-us notification (to admin) ──────────
export async function sendContactNotification(submission: {
  name: string;
  brand?: string | null;
  message: string;
}) {
  const body = `
    <p>You have a new "work with us" enquiry ✦</p>
    <p style="margin:16px 0 6px 0;color:#8a8378;font-size:13px;">FROM</p>
    <p style="margin:0;font-weight:600;">${submission.name}</p>
    ${
      submission.brand
        ? `<p style="margin:8px 0 0 0;color:#555;">Brand / company: ${submission.brand}</p>`
        : ""
    }
    <p style="margin:20px 0 6px 0;color:#8a8378;font-size:13px;">CAMPAIGN BRIEF</p>
    <p style="margin:0;white-space:pre-wrap;">${escapeHtml(submission.message)}</p>
  `;
  return send({
    to: CONTACT_NOTIFY_EMAIL,
    subject: `New collab enquiry from ${submission.name} ✦`,
    html: layout({ heading: "New enquiry!", bodyHtml: body }),
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
