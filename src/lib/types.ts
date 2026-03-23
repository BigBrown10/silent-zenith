export type PainCategory = 'Financial' | 'Process' | 'Productivity' | 'Trust' | 'Unknown';

export type Sentiment = 'Positive' | 'Neutral' | 'Negative';

export interface DataPoint {
  id: string;
  source: 'X' | 'Reddit' | 'HN' | 'News' | 'Trends' | 'ProductHunt' | 'GitHub' | 'VC';
  content: string;
  url: string;
  timestamp: number;
  author?: string;
  country?: string; // Optional, inferred or explicitly known
  metrics: {
    upvotes?: number;
    comments?: number;
    shares?: number;
    views?: number;
  };
}

export interface AnalyzedPain extends DataPoint {
  category: PainCategory;
  sentiment: Sentiment;
  intensityScore: number; // 1-10 (How painful is it?)
  marketGapScore: number; // 1-10 (How badly do current solutions fail?)
  walletConfidenceScore: number; // 1-10 (Proof of willingness to pay)
  jtbd: {
    functional: string;
    emotional: string;
    social: string;
  };
  keywords: string[];
}

export interface ProblemCluster {
  id: string;
  name: string;
  description: string;
  totalMentions: number;
  averagePainScore: number;
  averageMarketGap: number;
  primaryCategory: PainCategory;
  growthVelocity: number; // For the pulsing effect on the bubble map
  estimatedMarketSizeUSD?: number;
  points: AnalyzedPain[]; // The raw data fueling this cluster
  competitors: Competitor[];
}

export interface Competitor {
  id: string;
  name: string;
  url: string;
  description: string;
  pricing: {
    model: string;
    lowestTier?: number;
    highestTier?: number;
  };
  weaknesses: string[]; // Extracted from reviews/complaints
}

export interface Lead {
  id: string;
  platform: 'LinkedIn' | 'X';
  handle: string;
  name: string;
  bio?: string;
  painClusterId: string; // The problem they complained about
  status: 'Discovered' | 'Engaged' | 'DM_Sent' | 'Replied' | 'Trial_Offered' | 'Feedback_Received' | 'Converted';
  history: OutreachEvent[];
}

export interface OutreachEvent {
  timestamp: number;
  type: 'Like' | 'Comment' | 'DM' | 'Reply';
  content?: string;
  aiScore?: 'Truth Signal' | 'Fluff' | 'Complaint Gold' | 'None';
}
