import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@gojo-homes.com';

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to ጎጆ Homes 🏠',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#ffffff">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="font-size:32px;font-weight:900;color:#006AFF;margin:0">ጎጆ Homes</h1>
          <p style="color:#6b7280;margin:8px 0 0">Ethiopia's #1 Real Estate Platform</p>
        </div>
        <h2 style="font-size:24px;font-weight:700;color:#111827">Welcome, ${name}! 👋</h2>
        <p style="color:#4b5563;line-height:1.7">Thank you for joining ጎጆ Homes. You can now search properties, post listings, and connect with owners across Ethiopia.</p>
        <div style="margin:32px 0">
          <a href="https://www.gojo-homes.com" style="background:#E8431A;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px">Browse Properties 🏘️</a>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0"/>
        <p style="color:#9ca3af;font-size:13px;text-align:center">ጎጆ Homes · gojo-homes.com · Addis Ababa, Ethiopia 🇪🇹</p>
      </div>
    `,
  });
}

export async function sendListingApprovedEmail(to: string, listingTitle: string, listingId: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: '✅ Your listing is now LIVE on ጎጆ Homes!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#ffffff">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="font-size:32px;font-weight:900;color:#006AFF;margin:0">ጎጆ Homes</h1>
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
          <div style="font-size:48px">✅</div>
          <h2 style="color:#15803d;margin:8px 0">Your listing is LIVE!</h2>
        </div>
        <p style="color:#4b5563;line-height:1.7">Your property listing <strong>${listingTitle}</strong> has been reviewed and approved. It is now live on ጎጆ Homes and visible to thousands of buyers and renters.</p>
        <div style="margin:32px 0">
          <a href="https://www.gojo-homes.com/properties/${listingId}" style="background:#E8431A;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px">View Your Listing 🏠</a>
        </div>
        <p style="color:#6b7280;font-size:14px">Your listing will be active for 3 months. You will receive reminders before it expires.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0"/>
        <p style="color:#9ca3af;font-size:13px;text-align:center">ጎጆ Homes · gojo-homes.com · Addis Ababa, Ethiopia 🇪🇹</p>
      </div>
    `,
  });
}

export async function sendExpiryWarningEmail(to: string, listingTitle: string, listingId: string, daysLeft: number) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ Your listing expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#ffffff">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="font-size:32px;font-weight:900;color:#006AFF;margin:0">ጎጆ Homes</h1>
        </div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
          <div style="font-size:48px">⚠️</div>
          <h2 style="color:#92400e;margin:8px 0">Listing expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!</h2>
        </div>
        <p style="color:#4b5563;line-height:1.7">Your listing <strong>${listingTitle}</strong> will expire in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>. Renew now for just <strong>ETB 300</strong> to keep it active for another 3 months.</p>
        <div style="margin:32px 0">
          <a href="https://www.gojo-homes.com/owner/listings/${listingId}/renew" style="background:#E8431A;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px">Renew for ETB 300 🔄</a>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0"/>
        <p style="color:#9ca3af;font-size:13px;text-align:center">ጎጆ Homes · gojo-homes.com · Addis Ababa, Ethiopia 🇪🇹</p>
      </div>
    `,
  });
}

export async function sendReservationConfirmedEmail(to: string, propertyTitle: string, checkIn: string, checkOut: string, amount: number) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: '🎉 Reservation Confirmed — ጎጆ Homes',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#ffffff">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="font-size:32px;font-weight:900;color:#006AFF;margin:0">ጎጆ Homes</h1>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
          <div style="font-size:48px">🎉</div>
          <h2 style="color:#1d4ed8;margin:8px 0">Reservation Confirmed!</h2>
        </div>
        <p style="color:#4b5563;line-height:1.7">Your reservation for <strong>${propertyTitle}</strong> has been confirmed.</p>
        <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:24px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span style="color:#6b7280">Check-in</span>
            <span style="font-weight:600;color:#111827">${checkIn}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span style="color:#6b7280">Check-out</span>
            <span style="font-weight:600;color:#111827">${checkOut}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid #e5e7eb;padding-top:12px;margin-top:12px">
            <span style="color:#6b7280">Deposit Paid</span>
            <span style="font-weight:700;color:#E8431A">ETB ${amount.toLocaleString()}</span>
          </div>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0"/>
        <p style="color:#9ca3af;font-size:13px;text-align:center">ጎጆ Homes · gojo-homes.com · Addis Ababa, Ethiopia 🇪🇹</p>
      </div>
    `,
  });
}