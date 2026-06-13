import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route runs on the server and uses the SERVICE ROLE key, which bypasses
// Row-Level Security. That is why it can insert a property row for a guest
// (email-verified, no account) without hitting the "owner_id = auth.jwt() -> sub"
// INSERT policy that was rejecting the client-side insert.
//
// IMPORTANT: the service role key must NEVER be exposed to the browser. It is
// read here from the server-only env var SUPABASE_SERVICE_ROLE_KEY.

export const runtime = 'nodejs';

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ownerName, ownerEmail, ownerPhone, ownerId, photoUrls, form } = body || {};

    // --- Basic guard: email + a title must be present.
    if (!ownerEmail || !form?.title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (email or title).' },
        { status: 400 }
      );
    }

    const supabase = admin();

    const locationParts = [
      form.specific_location,
      form.kebele,
      form.woreda,
      form.subcity,
      form.city,
    ].filter(Boolean);

    const { data, error } = await supabase
      .from('properties')
      .insert({
        owner_id: ownerId || null,
        title: form.title,
        description: form.description,
        type: form.type,
        property_kind: form.property_kind || null,
        currency: form.currency,
        price: form.price_negotiable ? 0 : parseFloat(form.price),
        price_negotiable: form.price_negotiable,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        total_rooms: form.total_rooms ? parseInt(form.total_rooms) : null,
        area: form.area ? parseFloat(form.area) : null,
        area_sqm: form.area ? parseFloat(form.area) : null,
        condition: form.condition,
        location: locationParts.join(', '),
        subcity: form.subcity,
        latitude: form.lat ? parseFloat(form.lat) : null,
        longitude: form.lng ? parseFloat(form.lng) : null,
        images: photoUrls || [],
        amenities: form.amenities || [],
        nearby_landmarks: form.nearby_landmarks || [],
        plot_area_sqm: form.plot_area_sqm ? parseFloat(form.plot_area_sqm) : null,
        land_length_m: form.land_length_m ? parseFloat(form.land_length_m) : null,
        land_width_m: form.land_width_m ? parseFloat(form.land_width_m) : null,
        land_slope: form.land_slope || null,
        corner_plot: form.corner_plot,
        bathroom_type: form.bathroom_type,
        kitchen_type: form.kitchen_type,
        distance_to_road_m: form.distance_to_road_m ? parseInt(form.distance_to_road_m) : null,
        road_type: form.road_type,
        ground_water: form.ground_water,
        water_tanker: form.water_tanker,
        parking_spaces: form.parking_spaces ? parseInt(form.parking_spaces) : null,
        has_compound_wall: form.has_compound_wall,
        has_guard_house: form.has_guard_house,
        internet_type: form.internet_type,
        electricity_reliability: form.electricity_reliability,
        construction_stage: form.construction_stage || null,
        construction_material: form.construction_material || null,
        roof_type: form.roof_type || null,
        bank_loan_eligible: form.bank_loan_eligible,
        bank_loan_amount: form.bank_loan_amount ? parseFloat(form.bank_loan_amount) : null,
        bank_loan_bank: form.bank_loan_bank || null,
        title_deed_type: form.title_deed_type || null,
        has_service_room: form.has_service_room,
        has_traditional_kitchen: form.has_traditional_kitchen,
        has_store_room: form.has_store_room,
        has_guard_room: form.has_guard_room,
        has_prayer_room: form.has_prayer_room,
        has_boys_quarter: form.has_boys_quarter,
        diaspora_friendly: form.diaspora_friendly,
        managed_property: form.managed_property,
        status: 'pending_review',
        owner_email: ownerEmail,
        owner_whatsapp: ownerPhone,
        owner_name: ownerName,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
