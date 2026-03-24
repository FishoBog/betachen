import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/owner/listings/new', '/messages'],
      },
    ],
    sitemap: 'https://www.gojo-homes.com/sitemap.xml',
    host: 'https://www.gojo-homes.com',
  };
}