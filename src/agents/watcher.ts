import { store } from '../lib/store';
import { analyzePain } from '../lib/gemini';
import { scrapeX } from '../scrapers/twitter';
import { scrapeReddit } from '../scrapers/reddit';
import { scrapeNews } from '../scrapers/news';

export class WatcherEngine {
  private isRunning: boolean = false;

  async start(keywords: string[]) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[Watcher] Starting global sweep for: ${keywords.join(', ')}`);

    try {
      // 1. Ingest Data from free sources (Promises run in parallel)
      const [xSignals, redditSignals, newsSignals] = await Promise.all([
        scrapeX(keywords),
        scrapeReddit(keywords),
        scrapeNews(keywords)
      ]);

      const allSignals = [...xSignals, ...redditSignals, ...newsSignals];
      console.log(`[Watcher] Received ${allSignals.length} raw signals.`);

      // 2. Process through Gemini Pain Analyzer
      for (const signal of allSignals) {
        // Skip low engagement noise early to save API tokens
        if ((signal.metrics.views || 0) < 100 && (signal.metrics.upvotes || 0) < 5) {
            continue; 
        }

        const analyzed = await analyzePain(signal);
        
        if (analyzed && analyzed.intensityScore >= 6) {
            console.log(`[Watcher] 🔥 High Pain Detected: Score ${analyzed.intensityScore} | Gap ${analyzed.marketGapScore}`);
            console.log(` -> "${analyzed.content.substring(0, 80)}..."`);
            // 3. Save to Store (which auto-clusters for the Bubble Map)
            store.addPain(analyzed);
        }
      }

    } catch (e) {
        console.error('[Watcher] Critical failure during sweep:', e);
    } finally {
        this.isRunning = false;
    }
  }

  stop() {
    this.isRunning = false;
    console.log('[Watcher] Halted.');
  }
}

export const watcher = new WatcherEngine();
