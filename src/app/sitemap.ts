import { MetadataRoute } from 'next';
import { MASTER_TOOLS_LIST } from '@/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
     const baseUrl = 'https://toollok.com';

     // Static routes
     const staticRoutes = ['', '/popular', '/about', '/contact', '/privacy', '/terms', '/disclaimer', '/sitemap'].map((route) => ({
          url: `${baseUrl}${route}`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: route === '' ? 1.0 : 0.8,
     }));

     // Dynamic tool routes
     const toolRoutes = MASTER_TOOLS_LIST.map((tool) => ({
          url: `${baseUrl}${tool.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
     }));

     return [...staticRoutes, ...toolRoutes];
}