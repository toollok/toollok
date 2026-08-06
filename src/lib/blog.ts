import { MOCK_BLOG_POSTS, BLOG_CATEGORIES, BLOG_AUTHORS } from "@/constants/blog";
import { BlogPost, BlogCategory, BlogAuthor } from "@/types/blog";

export async function getAllPosts(): Promise<BlogPost[]> {
     // Simulate network/DB latency for Server Components
     return MOCK_BLOG_POSTS.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
     const post = MOCK_BLOG_POSTS.find(p => p.slug === slug);
     return post || null;
}

export async function getFeaturedPost(): Promise<BlogPost | null> {
     const post = MOCK_BLOG_POSTS.find(p => p.isFeatured);
     return post || null;
}

export async function getCategoryById(id: string): Promise<BlogCategory | null> {
     return BLOG_CATEGORIES.find(c => c.id === id) || null;
}

export async function getAuthorById(id: string): Promise<BlogAuthor | null> {
     return BLOG_AUTHORS[id] || null;
}