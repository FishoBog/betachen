import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Updates an EXISTING property by id. Like the create route, this runs server-
// side with the SERVICE ROLE key so it bypasses RLS (a guest owner has no
// auth.jwt() sub to satisfy an UPDATE policy). The service role key is read
// from the server-only env var and must never reach the browser.
//
// This route only writes the editable listing fields. It deliberately does NOT
// change status, owner_*, created_at, expires_at, or payment state — editing
// content should never silently re-open review state or alter ownership.

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
    const { id, photoUrls, form } = body || {};

    // --- Basic guards
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing listing id.' },
        { status: 400 }
      );
    }
    if (!form?.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required.' },
        { status: 400 }
      );
    }

    const supabase = admin();

    // Rebuild the human-readable location string exactly like the create route.
    const locationParts = [
      form.specific_location,
      form.kebele,
      form.woreda,
      form.subcity,
      form.city,
    ].filter(Boolean);

    // Only set fields that were actually provided. We mirror the create route's
    // column mapping so an edited listing writes to the same columns the same way.
    const updates: Record<string, any> = {
      title: form.title,
      description: form.description,
      type: form.type,
      property_kind: form.property_kind || null,
      currency: form.currency,
      price: form.price_negotiable ? 0 : parseFloat(form.price),
      price_negotiable: form.price_negotiable,
      condition: form.condition,
      location: locationParts.join(', '),
      subcity: form.subcity,
    };

    // Numeric/optional fields — only include when the client actually sent them,
    // so a focused edit (which omits deep fields) never wipes existing values.
    const maybe = (key: string, val: any) => { if (val !== undefined) updates[key] = val; };
    maybe('bedrooms', form.bedrooms !== undefined ? (form.bedrooms ? parseInt(form.bedrooms) : null) : undefined);
    maybe('bathrooms', form.bathrooms !== undefined ? (form.bathrooms ? parseInt(form.bathrooms) : null) : undefined);
    maybe('total_rooms', form.total_rooms !== undefined ? (form.total_rooms ? parseInt(form.total_rooms) : null) : undefined);
    maybe('area', form.area !== undefined ? (form.area ? parseFloat(form.area) : null) : undefined);
    maybe('area_sqm', form.area !== undefined ? (form.area ? parseFloat(form.area) : null) : undefined);
    maybe('latitude', form.lat !== undefined ? (form.lat ? parseFloat(form.lat) : null) : undefined);
    maybe('longitude', form.lng !== undefined ? (form.lng ? parseFloat(form.lng) : null) : undefined);
    maybe('amenities', form.amenities !== undefined ? (form.amenities || []) : undefined);
    maybe('nearby_landmarks', form.nearby_landmarks !== undefined ? (form.nearby_landmarks || []) : undefined);
    maybe('plot_area_sqm', form.plot_area_sqm !== undefined ? (form.plot_area_sqm ? parseFloat(form.plot_area_sqm) : null) : undefined);
    maybe('land_length_m', form.land_length_m !== undefined ? (form.land_length_m ? parseFloat(form.land_length_m) : null) : undefined);
    maybe('land_width_m', form.land_width_m !== undefined ? (form.land_width_m ? parseFloat(form.land_width_m) : null) : undefined);
    maybe('land_slope', form.land_slope !== undefined ? (form.land_slope || null) : undefined);
    maybe('corner_plot', form.corner_plot);
    maybe('bathroom_type', form.bathroom_type);
    maybe('kitchen_type', form.kitchen_type);
    maybe('distance_to_road_m', form.distance_to_road_m !== undefined ? (form.distance_to_road_m ? parseInt(form.distance_to_road_m) : null) : undefined);
    maybe('road_type', form.road_type);
    maybe('ground_water', form.ground_water);
    maybe('water_tanker', form.water_tanker);
    maybe('parking_spaces', form.parking_spaces !== undefined ? (form.parking_spaces ? parseInt(form.parking_spaces) : null) : undefined);
    maybe('has_compound_wall', form.has_compound_wall);
    maybe('has_guard_house', form.has_guard_house);
    maybe('internet_type', form.internet_type);
    maybe('electricity_reliability', form.electricity_reliability);
    maybe('construction_stage', form.construction_stage !== undefined ? (form.construction_stage || null) : undefined);
    maybe('construction_material', form.construction_material !== undefined ? (form.construction_material || null) : undefined);
    maybe('roof_type', form.roof_type !== undefined ? (form.roof_type || null) : undefined);
    maybe('bank_loan_eligible', form.bank_loan_eligible);
    maybe('bank_loan_amount', form.bank_loan_amount !== undefined ? (form.bank_loan_amount ? parseFloat(form.bank_loan_amount) : null) : undefined);
    maybe('bank_loan_bank', form.bank_loan_bank !== undefined ? (form.bank_loan_bank || null) : undefined);
    maybe('title_deed_type', form.title_deed_type !== undefined ? (form.title_deed_type || null) : undefined);
    maybe('has_service_room', form.has_service_room);
    maybe('has_traditional_kitchen', form.has_traditional_kitchen);
    maybe('has_store_room', form.has_store_room);
    maybe('has_guard_room', form.has_guard_room);
    maybe('has_prayer_room', form.has_prayer_room);
    maybe('has_boys_quarter', form.has_boys_quarter);
    maybe('diaspora_friendly', form.diaspora_friendly);
    maybe('managed_property', form.managed_property);

    // Only overwrite images when the client actually sent a photo array, so an
    // edit that doesn't touch photos won't wipe the existing ones.
    if (Array.isArray(photoUrls)) {
      updates.images = photoUrls;
    }

    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
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
