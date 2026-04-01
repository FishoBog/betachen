import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendExpiryEmail(property: any, daysLeft: number) {
  const renewalCost = 300;
  const subject = daysLeft === 0
    ? `Your ቤታችን listing "${property.title}" has expired`
    : `Your ቤታችን listing expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;

  const message = daysLeft === 0 ? `
    <h2>Your listing has expired</h2>
    <p>Your property listing <strong>"${property.title}"</strong> on ቤታችን has expired and is no longer visible to buyers/renters.</p>
    <p>To reactivate it for another 3 months, pay a renewal fee of <strong>ETB ${renewalCost}</strong> (60% of the original listing fee).</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/owner/listings/${property.id}/renew" 
       style="background:#E8431A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:16px">
      Renew Listing — ETB ${renewalCost}
    </a>
  ` : `
    <h2>Your listing expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}</h2>
    <p>Your property listing <strong>"${property.title}"</strong> on ቤታችን will expire on 
    <strong>${new Date(property.expires_at).toLocaleDateString('en-ET', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
    <p>To keep your listing active for another 3 months, renew now for just <strong>ETB ${renewalCost}</strong>.</p>
    <p style="color:#6b7280;font-size:13px">This is a ${daysLeft === 30 ? '30-day' : daysLeft === 7 ? '7-day' : '1-day'} advance notice.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/owner/listings/${property.id}/renew"
       style="background:#006AFF;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:16px">
      Renew Now — ETB ${renewalCost}
    </a>
    <p style="margin-top:16px;font-size:13px">If your property is already sold or rented, you can 
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/owner/listings/${property.id}">mark it as sold/rented</a> to close the listing.</p>
  `;

  // Log for now — connect Resend/SendGrid here
  console.log(`EMAIL → ${property.owner_email}: ${subject}`);
  console.log(message);

  // Uncomment when you have Resend configured:
  // await resend.emails.send({
  //   from: 'ቤታችን <noreply@Betachen-et.com>',
  //   to: property.owner_email,
  //   subject,
  //   html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">${message}<hr/><p style="font-size:11px;color:#9ca3af">ቤታችን Real Estate • Betachen-et.netlify.app</p></div>`
  // });

  // Log notification
  await supabase.from('expiry_notifications').insert({
    property_id: property.id,
    notification_type: daysLeft === 0 ? 'expired' : `${daysLeft}_days`,
    days_before_expiry: daysLeft,
  });
}

export async function GET(req: NextRequest) {
  // Protect with secret key
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const in30 = new Date(now); in30.setDate(in30.getDate() + 30);
    const in7 = new Date(now); in7.setDate(in7.getDate() + 7);
    const in1 = new Date(now); in1.setDate(in1.getDate() + 1);

    // Fetch all active listings
    const { data: listings } = await supabase
      .from('properties')
      .select('*')
      .in('status', ['active', 'pending_review'])
      .not('expires_at', 'is', null);

    if (!listings) return NextResponse.json({ processed: 0 });

    let processed = 0;

    for (const listing of listings) {
      const expiresAt = new Date(listing.expires_at);
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // EXPIRED — mark as expired
      if (daysLeft <= 0 && listing.status !== 'expired') {
        await supabase.from('properties').update({ status: 'expired' }).eq('id', listing.id);
        if (listing.owner_email) await sendExpiryEmail(listing, 0);
        processed++;
        continue;
      }

      // 30 days warning
      if (daysLeft <= 30 && daysLeft > 7 && !listing.expiry_notified_30 && listing.owner_email) {
        await sendExpiryEmail(listing, 30);
        await supabase.from('properties').update({ expiry_notified_30: true }).eq('id', listing.id);
        processed++;
      }

      // 7 days warning
      if (daysLeft <= 7 && daysLeft > 1 && !listing.expiry_notified_7 && listing.owner_email) {
        await sendExpiryEmail(listing, 7);
        await supabase.from('properties').update({ expiry_notified_7: true }).eq('id', listing.id);
        processed++;
      }

      // 1 day warning
      if (daysLeft <= 1 && daysLeft > 0 && !listing.expiry_notified_1 && listing.owner_email) {
        await sendExpiryEmail(listing, 1);
        await supabase.from('properties').update({ expiry_notified_1: true }).eq('id', listing.id);
        processed++;
      }
    }

    return NextResponse.json({ success: true, processed, total: listings.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
