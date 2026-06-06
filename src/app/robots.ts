// v2
import { NextRequest, NextResponse } from 'next/server';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/owner/', '/settings/', '/api/'],
    },
    sitemap: 'https://betachen.com/sitemap.xml',
  };
}
