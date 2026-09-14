/**
 * Demo sample emails for the UI (form fillers only — scoring still goes through FastAPI).
 */
export const SAMPLES = [
  {
    id: "phishing",
    name: "Bank alert",
    subject: "URGENT: Your account will be suspended within 24 hours",
    body: `Dear Customer,

We detected unusual sign-in activity on your account. Your account will be suspended within 24 hours unless you verify your identity immediately.

Click here to confirm your details: http://secure-paypal-verify.account-check.top/login?ref=8837

You will need to update your payment details and provide your one-time code to complete the review.

Failure to act now will result in permanent closure.

Security Department`,
  },
  {
    id: "suspicious",
    name: "Delivery notice",
    subject: "Your parcel is on hold - payment failed",
    body: `Hello,

Your parcel could not be delivered because a small customs payment failed. Please reschedule delivery below within 24 hours or the package returns to sender.

https://bit.ly/3xDelivery-reschedule

Thank you,
DHL Delivery Team`,
  },
  {
    id: "safe",
    name: "Team note",
    subject: "Notes from Tuesday's planning session",
    body: `Hi Maya,

Thanks for running the planning session. I wrote up the decisions and the open questions here:

https://github.com/our-team/planning-notes

No rush on feedback. Sometime before Friday is fine. I'll book the follow-up once you've had a look.

Cheers,
Sam`,
  },
];

export const SAFETY_TIPS = [
  "Never share a verification code from SMS or email.",
  "If unsure, open the real site from your bookmarks, not from the message.",
  "Banks never ask for your password by email.",
  "A real urgency deadline is rare. Pressure is a phishing sign.",
];

/**
 * Action guidance from classification (frontend-only; not from the API).
 * @param {string} classification
 */
export function adviceFor(classification) {
  if (classification === "phishing") {
    return "Do not click any links or attachments. Open the real site from a bookmark or official app, then delete or report the email.";
  }
  if (classification === "suspicious") {
    return "Pause before acting. Do not use links in the message. Confirm with the sender through a phone number or address you already trust.";
  }
  return "Looks low risk, but stay cautious. Check the sender address, and type important sites yourself instead of following links.";
}
