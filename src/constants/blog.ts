import { BlogCategory, BlogAuthor } from "@/types/blog";
import { ALL_BLOG_POSTS } from "@/content/blog";

export const BLOG_CATEGORIES: BlogCategory[] = [
     { id: "dev", name: "Developer Tools", slug: "developer-tools", description: "Deep dives into architecture, code, and APIs.", iconName: "Code", colorTheme: "from-blue-600 to-cyan-500" },
     { id: "seo", name: "SEO Tools", slug: "seo-tools", description: "Mastering search intent, schema, and rankings.", iconName: "Search", colorTheme: "from-cyan-500 to-blue-600" },
     { id: "ai", name: "AI Tools", slug: "ai-tools", description: "Artificial intelligence and machine learning guides.", iconName: "Bot", colorTheme: "from-purple-500 to-indigo-600" },
     { id: "business", name: "Business Tools", slug: "business-tools", description: "Strategies for growth, management, and scaling.", iconName: "Briefcase", colorTheme: "from-amber-500 to-orange-600" },
     { id: "analytics", name: "Analytics Tools", slug: "analytics-tools", description: "Market data, derivatives, and performance tracking.", iconName: "TrendingUp", colorTheme: "from-emerald-500 to-teal-400" },
     { id: "privacy", name: "Privacy Tools", slug: "privacy-tools", description: "Data protection, encryption, and local processing.", iconName: "Shield", colorTheme: "from-teal-400 to-emerald-600" },
     { id: "productivity", name: "Productivity Tools", slug: "productivity-tools", description: "Workflow optimization and time management.", iconName: "Zap", colorTheme: "from-yellow-400 to-amber-500" },
     { id: "content", name: "Content Creator Tools", slug: "content-creator-tools", description: "Design, writing, and multimedia creation.", iconName: "PenTool", colorTheme: "from-pink-500 to-rose-600" },
];

export const BLOG_AUTHORS: Record<string, BlogAuthor> = {
     "toollok": {
          id: "toollok",
          name: "ToolLok",
          role: "Lead Architect",
          avatarUrl: "/avatars/subham.jpg",
          bio: "Full-stack developer and quantitative systems architect."
     }
};

export const MOCK_BLOG_POSTS = ALL_BLOG_POSTS;