import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertyInfo } from '@/components/property/PropertyInfo';
import { ContactOwnerCard } from '@/components/property/ContactOwnerCard';
import { PropertyReviews } from '@/components/reviews/PropertyReviews';
import { ViewTracker } from '@/components/property/ViewTracker';
import { ListingActions } from '@/components/property/ListingActions';
import { createServerClient } from '@/lib/supabase';
import { typeLabel, formatPrice } from '@/lib/utils';
import type { Property } from '@/types';

interface Props { params: Promise<{ id: string }> }

export default async function PropertyDetailPage({ params: paramsPromise }: Props) {
  const { id } = await paramsPromise;
  const supabase = createServerClient();
  const { data: property } = await supabase
    .from('properties')
    .select('*, property_images(*), profiles(*)')
    .eq('id', id)
    .single();

  if (!property) notFound();

  return (
    <div className="min-h-screen">
      <Navbar />
      <ViewTracker propertyId={id} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md text-white mr-3"
            style={{ background: property.type === 'sale' ? 'var(--navy)' : property.type === 'long_rent' ? 'var(--teal)' : 'var(--coral)' }}>
            {typeLabel(property.type)}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold mt-2" style={{ color: 'var(--navy)' }}>{property.title}</h1>
          <p className="text-gray-500 mt-1">{property.location_name}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PropertyGallery images={property.property_images ?? []} />
            <PropertyInfo property={property as Property} />
            <PropertyReviews propertyId={id} />
          </div>
          <div>
            <ContactOwnerCard property={property as Property} />
            <div className="mt-4">
              <ListingActions propertyId={id} status={property.status} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
