import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.gojo-homes.com';

  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at')
    .eq('status', 'active')
    .limit(1000);

  const propertyUrls = (properties ?? []).map(p => ({
    url: `${baseUrl}/properties/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/market`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/diaspora`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/owner/verify`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/sign-in`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/sign-up`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    ...propertyUrls,
  ];
}