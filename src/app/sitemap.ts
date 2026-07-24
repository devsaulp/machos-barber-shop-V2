import type { MetadataRoute } from 'next';
import { NEGOCIO } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: NEGOCIO.url, changeFrequency: 'weekly', priority: 1 },
    { url: `${NEGOCIO.url}/servicios`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${NEGOCIO.url}/reservar`, changeFrequency: 'daily', priority: 0.9 },
  ];
}
