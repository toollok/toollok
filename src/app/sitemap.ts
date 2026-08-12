import { MetadataRoute } from 'next';
import { MASTER_TOOLS_LIST } from '@/constants';
import { ALL_BLOG_POSTS } from '@/content/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
     const baseUrl = 'https://toollok.com';
     const currentDate = new Date();

     // 1. Core Static Routes
     const staticRoutes = [
          '',
          '/blog',
          '/popular',
          '/categories', // This is for Tool Categories (Main Navbar), keeping it intact
          '/about',
          '/contact',
          '/privacy',
          '/terms',
          '/disclaimer'
     ].map((route) => ({
          url: `${baseUrl}${route}`,
          lastModified: currentDate,
          changeFrequency: 'daily' as const,
          priority: route === '' ? 1.0 : 0.8,
     }));

     // 2. Dynamic Tool Routes
     const toolRoutes = MASTER_TOOLS_LIST.map((tool) => ({
          url: `${baseUrl}${tool.slug.startsWith('/') ? tool.slug : `/${tool.slug}`}`,
          lastModified: currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.9,
     }));

     // 3. Dynamic Blog Post Routes
     const blogRoutes = ALL_BLOG_POSTS.map((post) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.publishedAt),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
     }));

     // Consolidate everything into a single array
     return [...staticRoutes, ...toolRoutes, ...blogRoutes];
}