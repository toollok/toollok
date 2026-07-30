export type Tier = "free" | "freemium" | "premium";

export interface Tool {
     id: string;
     name: string;
     description: string;
     category: string; // Slug matching category
     slug: string;
     iconName: string;
     tier: Tier;
     isPopular?: boolean;
     isTrending?: boolean;
     isRecent?: boolean;
     badgeText?: string;
     howToUse?: string[];
}

export interface Category {
     id: string;
     name: string;
     slug: string;
     description: string;
     iconName: string;
     toolCount: number;
     colorTheme: string;
}

export interface FAQItem {
     question: string;
     answer: string;
}

export interface Testimonial {
     id: string;
     name: string;
     role: string;
     company: string;
     content: string;
     avatarUrl: string;
}