import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import { AnalyzedPain, DataPoint, Sentiment, PainCategory } from './types';

// Ensure the API key is available
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');
// Using the 1.5 Pro model as it's the standard for complex JSON reasoning
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// Schema for the Pain Analyzer
const PainAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    category: {
      type: SchemaType.STRING,
      enum: ['Financial', 'Process', 'Productivity', 'Trust', 'Unknown'],
      description: 'The primary category of the pain point.'
    },
    sentiment: {
      type: SchemaType.STRING,
      enum: ['Positive', 'Neutral', 'Negative'],
      description: 'The emotional tone of the text. Complaints should be Negative.'
    },
    intensityScore: {
      type: SchemaType.INTEGER,
      description: '1-10 scale. How intense is this pain? 10 = I am actively losing money or dying without a solution. 1 = nice to have.'
    },
    marketGapScore: {
      type: SchemaType.INTEGER,
      description: '1-10 scale. How badly are existing solutions failing this person? 10 = no solution exists or current ones are garbage.'
    },
    walletConfidenceScore: {
        type: SchemaType.INTEGER,
        description: '1-10 scale. Is there evidence they are already paying for a workaround (hiring people, buying bad software)? 10 = explicitly stated they pay.'
    },
    jtbd: {
      type: SchemaType.OBJECT,
      properties: {
        functional: { type: SchemaType.STRING, description: 'What task are they trying to complete?' },
        emotional: { type: SchemaType.STRING, description: 'How do they want to feel? (e.g., relieved, secure)' },
        social: { type: SchemaType.STRING, description: 'How do they want to be perceived by others?' }
      },
      required: ['functional', 'emotional', 'social']
    },
    keywords: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: '3-5 key topics/tags from this text (e.g., "SaaS", "Billing", "Stripe API").'
    }
  },
  required: ['category', 'sentiment', 'intensityScore', 'marketGapScore', 'walletConfidenceScore', 'jtbd', 'keywords']
};

export async function analyzePain(data: DataPoint): Promise<AnalyzedPain | null> {
  try {
    const prompt = `
    Analyze the following social media post/complaint to extract "Expensive Pain" signals for a startup validation engine.
    
    Source Platform: ${data.source}
    Text: "${data.content}"
    
    Identify the Jobs-to-be-Done (JTBD), score the intensity of the pain, and evaluate the market gap. Be extremely critical—if it's just a mild annoyance, give it a low score. Look for "wallet signals" that suggest they are already spending money to solve this poorly.
    `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: PainAnalysisSchema as Schema,
            temperature: 0.1, // Keep it deterministic
        }
    });

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return {
      ...data,
      category: parsed.category as PainCategory,
      sentiment: parsed.sentiment as Sentiment,
      intensityScore: parsed.intensityScore,
      marketGapScore: parsed.marketGapScore,
      walletConfidenceScore: parsed.walletConfidenceScore,
      jtbd: parsed.jtbd,
      keywords: parsed.keywords
    };
  } catch (error) {
    console.error('Error analyzing pain with Gemini:', error);
    return null;
  }
}

// Schema for the 'Mom Test' Reply Analyzer
const ReplySchema = {
    type: SchemaType.OBJECT,
    properties: {
        classification: {
            type: SchemaType.STRING,
            enum: ['Truth Signal', 'Fluff', 'Complaint Gold', 'None'],
            description: "Categorize the raw response to our outreach. 'Truth Signal' = fact about past behavior/spending. 'Fluff' = complimenting the idea but no commitment. 'Complaint Gold' = they ignored our idea and vented about a related problem."
        },
        reasoning: {
            type: SchemaType.STRING,
            description: 'Why you chose this classification.'
        }
    },
    required: ['classification', 'reasoning']
};

export async function analyzeReply(replyText: string): Promise<'Truth Signal' | 'Fluff' | 'Complaint Gold' | 'None'> {
    try {
        const prompt = `
        Analyze this reply from a potential B2B customer based on the principles of the "Mom Test".
        
        Text: "${replyText}"
        
        Classify it into one of these buckets:
        - "Truth Signal": They reveal a hard fact about their past behavior, current workflow, or current spending.
        - "Fluff": They say your idea "sounds great" or "they would definitely buy it" (these are lies to protect your feelings).
        - "Complaint Gold": They mention a specific, deep frustration with their current process.
        - "None": Irrelevant, generic, or "unsubscribe".
        `;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: ReplySchema as Schema,
                temperature: 0.1,
            }
        });

        const parsed = JSON.parse(result.response.text());
        return parsed.classification;

    } catch (e) {
        console.error('Error analyzing reply:', e);
        return 'None';
    }
}
