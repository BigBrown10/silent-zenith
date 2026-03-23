import { DataPoint } from '../lib/types';

// Uses NewsData.io (Free 200 req/day) or WorldNewsAPI (Free Tier)
// Good for tracking macro trends, funding announcements, and VC movements.

export async function scrapeNews(keywords: string[]): Promise<DataPoint[]> {
    console.log(`[Scraper:News] Scanning global news for: ${keywords.join(', ')}`);
    
    // Mocking the NewsData.io response format
    return [
        {
            id: `news_${Date.now()}_1`,
            source: 'News',
            content: 'Global SaaS investment drops 12% in Q1 2026, but "Micro-SaaS" startups targeting specific workflow bottlenecks (like invoice automation and API management) see a 40% surge in seed funding.',
            url: 'https://techcrunch.com/fake-article',
            timestamp: Date.now(),
            country: 'US', // Important for the Pain Arbitrage Scanner
            metrics: { views: 150000, shares: 3200 }
        },
        {
            id: `news_${Date.now()}_2`,
            source: 'News',
            content: 'European regulations on data privacy force widespread adoption of new cookie-consent tools. Over 50,000 small businesses in Germany alone report compliance issues costing an average of €2,000 annually in legal fees.',
            url: 'https://sifted.eu/fake-article',
            timestamp: Date.now() - (86400000 * 2),
            country: 'DE',
            metrics: { views: 85000, shares: 900 }
        }
    ];
}
