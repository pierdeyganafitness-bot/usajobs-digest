const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendDigest(html, jobCount) {
  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,         // e.g. "digest@yourdomain.com"
      to: [process.env.EMAIL_TO],           // your email address
      subject: `Federal Jobs Digest: ${jobCount} new listing${jobCount !== 1 ? "s" : ""} this week`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }

  return res.json();
}
