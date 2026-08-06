export interface BlogCategory {
     id: string;
     name: string;
     slug: string;
     description: string;
     iconName: string;
     colorTheme: string;
}

export interface BlogAuthor {
     id: string;
     name: string;
     role: string;
     avatarUrl: string;
     bio: string;
     twitter?: string;
     linkedin?: string;
}

export interface BlogPost {
     id: string;
     slug: string;
     title: string;
     excerpt: string;
     content: string; // MDX or HTML
     coverImage: string;
     publishedAt: string;
     updatedAt?: string;
     readingTime: string; // e.g., "5 min read"
     authorId: string;
     categoryId: string;
     tags: string[];
     relatedToolIds: string[]; // Direct mapping to MASTER_TOOLS_LIST in constants
     seo: {
          metaTitle: string;
          metaDescription: string;
          keywords: string[];
     };
     isFeatured?: boolean;
     isPopular?: boolean;
}