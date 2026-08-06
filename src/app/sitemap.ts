import { MetadataRoute } from 'next';
import { MASTER_TOOLS_LIST } from '@/constants';
import { ALL_BLOG_POSTS } from '@/content/blog';
import { BLOG_CATEGORIES } from '@/constants/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
     const baseUrl = 'https://toollok.com';

     // Static routes (Added '/blog' to ensure the blog index is crawled)
     const staticRoutes = ['', '/blog', '/popular', '/about', '/contact', '/privacy', '/terms', '/disclaimer', '/sitemap'].map((route) => ({
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

     // Dynamic Blog Post routes
     const blogRoutes = ALL_BLOG_POSTS.map((post) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.publishedAt),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
     }));

     // Dynamic Blog Category routes
     const categoryRoutes = BLOG_CATEGORIES.map((category) => ({
          url: `${baseUrl}/blog/category/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
     }));

     return [...staticRoutes, ...toolRoutes, ...blogRoutes, ...categoryRoutes];
}