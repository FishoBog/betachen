export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/owner/', '/settings/', '/api/'],
    },
    sitemap: 'https://betachen.com/sitemap.xml',
  };
}
