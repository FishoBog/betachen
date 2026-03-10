'use client';

export const dynamic = 'force-dynamic';

import { Navbar } from '@/components/layout/Navbar';
import { PropertyUploadForm } from '@/components/property/PropertyUploadForm';

export default function NewListingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Post a Listing</h1>
        <PropertyUploadForm />
      </main>
    </div>
  );
}
