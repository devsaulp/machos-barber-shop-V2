import type { MetadataRoute } from 'next';
import { NEGOCIO } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${NEGOCIO.url}/sitemap.xml`,
  };
}
