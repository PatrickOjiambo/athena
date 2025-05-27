export interface NewsApiResponse {
    status: string;
    totalResults: number;
    results: NewsArticle[];
}

export interface NewsArticle {
    article_id: string;
    title: string;
    link: string;
    keywords: string[] | null;
    creator: string[] | null;
    description: string | null;
    content: string | null;
    pubDate: string;
    pubDateTZ: string;
    image_url: string | null;
    video_url: string | null;
    source_id: string;
    source_name: string;
    source_priority: number;
    source_url: string;
    source_icon: string;
    language: string;
    country: string[];
    category: string[];
    sentiment: string;
    sentiment_stats: SentimentStats;
    ai_tag: string[] | null;
    ai_region: string[] | null;
    ai_org: string[] | null;
    duplicate: boolean;
}

export interface SentimentStats {
    positive: number;
    neutral: number;
    negative: number;
}