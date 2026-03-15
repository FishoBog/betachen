import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { clerkId, fullName, idDocumentUrl, businessLicenseUrl } = await req.json();

    // Check existing request
    const { data: existing } = await supabase
      .from('verification_requests')
      .select('id, status')
      .eq('clerk_id', clerkId)
      .single();

    if (existing?.status === 'pending') {
      return NextResponse.json({ error: 'Verification already pending review' }, { status: 400 });
    }
    if (existing?.status === 'verified') {
      return NextResponse.json({ error: 'Already verified' }, { status: 400 });
    }

    // Submit new request
    await supabase.from('verification_requests').upsert({
      clerk_id: clerkId,
      full_name: fullName,
      id_document_url: idDocumentUrl,
      business_license_url: businessLicenseUrl,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    });

    // Update profile status
    await supabase.from('profiles')
      .update({ verification_status: 'pending' })
      .eq('clerk_id', clerkId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
