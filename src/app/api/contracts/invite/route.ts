import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TYPE_NAMES: Record<string, string> = {
  short_rent: 'አጭር ኪራይ ውል (Short-term Rental)',
  long_rent: 'ረጅም ኪራይ ውል (Long-term Rental)',
  nda: 'የምስጢር ስምምነት (NDA)',
  sale: 'የሽያጭ ውል (Sale Agreement)',
};

export async function POST(req: NextRequest) {
  try {
    const { contractId, tenantEmail, ownerName, contractType } = await req.json();

    const { data: contract } = await supabase.from('contracts').select('tenant_invite_token').eq('id', contractId).single();
    if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/contracts/join/${contract.tenant_invite_token}`;

    // Send email via Resend or similar — for now log it
    console.log(`Contract invite: ${inviteLink} → ${tenantEmail}`);

    // If you have Resend configured:
    // await resend.emails.send({
    //   from: 'ቤታችን <noreply@Betachen-et.com>',
    //   to: tenantEmail,
    //   subject: `Contract Invitation from ${ownerName} — ${TYPE_NAMES[contractType]}`,
    //   html: `<p>You have been invited to review and sign a contract.</p><a href="${inviteLink}">Click here to view and fill your details</a>`
    // });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
