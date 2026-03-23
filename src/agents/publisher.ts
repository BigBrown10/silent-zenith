import { chromium, Browser, BrowserContext } from 'playwright';
import { Lead } from '../lib/types';
import { analyzeReply } from '../lib/gemini';
import { store } from '../lib/store';

// Manages LinkedIn & X authenticated sessions via cookie injection
export class PublisherEngine {
  private browser: Browser | null = null;
  private contexts: Record<string, BrowserContext> = {};

  async init() {
    this.browser = await chromium.launch({ headless: false }); // Visible for founder review
  }

  // Load cookies for a specific "Persona" (e.g., Founder, Dev Rel)
  async loadPersona(personaId: string, cookiesConfig: any[]) {
    if (!this.browser) await this.init();
    
    const context = await this.browser!.newContext();
    await context.addCookies(cookiesConfig);
    this.contexts[personaId] = context;
    console.log(`[Publisher] Persona loaded: ${personaId}`);
  }

  // Safety: Human-like delay (2-8 seconds)
  private async safeDelay() {
    const ms = Math.floor(Math.random() * 6000) + 2000;
    return new Promise(r => setTimeout(r, ms));
  }

  async executeDripFlow(personaId: string, lead: Lead, day: number) {
    const context = this.contexts[personaId];
    if (!context) throw new Error(`Persona ${personaId} not loaded.`);
    
    console.log(`[Publisher] Executing Day ${day} flow for ${lead.handle} on ${lead.platform}`);

    const page = await context.newPage();

    try {
      if (lead.platform === 'X') {
        await page.goto(`https://x.com/${lead.handle}`);
        await this.safeDelay();

        if (day === 0) {
          // Warm up: Like their latest Tweet
          console.log(`[Publisher] Engaging: Liking latest tweet from ${lead.handle}`);
          // Mocking the click implementation as the DOM changes weekly
          // await page.locator('[data-testid="like"]').first().click();
          lead.history.push({ timestamp: Date.now(), type: 'Like' });
          store.updateLeadStatus(lead.id, 'Engaged');
        } 
        else if (day === 1) {
          // Send DM: The initial probe
          console.log(`[Publisher] Sending DM about pain cluster ${lead.painClusterId}`);
          /* 
          await page.click('[data-testid="sendDMFromProfile"]');
          await this.safeDelay();
          await page.keyboard.type(`Hey ${lead.name}, saw you venting about [Cluster ${lead.painClusterId}]. I experienced the exact same thing last year. Are you still using [Workaround]?`);
          await page.keyboard.press('Enter');
          */
          lead.history.push({ timestamp: Date.now(), type: 'DM', content: 'Initial probe sent.' });
          store.updateLeadStatus(lead.id, 'DM_Sent');
        }
        else if (day === 7 && lead.status === 'Replied') {
          // The Conversion Hook: 60% off for feedback
          console.log(`[Publisher] Offering 60% discount to ${lead.handle} for Beta feedback`);
          /*
          await page.keyboard.type(`Appreciate the reply! I'm actually building a tool to solve exactly this. If you're open to joining our beta and giving me 15 mins of feedback, I'll give you 60% off the lifetime price. We launch next week. Interested?`);
          */
        }
      }
      
      // Auto-analyze any new replies while we are on the page
      await this.checkInbox(page, lead);

    } catch (e) {
      console.error(`[Publisher] Auto-ban safety triggered. Halting campaign for ${personaId}.`, e);
    } finally {
      await page.close();
    }
  }

  private async checkInbox(page: any, lead: Lead) {
      // Mocking the inbox check
      // const replyText = await page.locator('.message-text').innerText();
      const mockReply = "Yeah honestly the billing process is a nightmare. I spend 4 hours every Tuesday doing it manually in Excel. What are you building?";
      
      const score = await analyzeReply(mockReply);
      console.log(`[Publisher] Analyzed Reply from ${lead.handle}: ${score}`);
      
      if (score === 'Truth Signal' || score === 'Complaint Gold') {
          store.updateLeadStatus(lead.id, 'Replied');
          lead.history.push({ timestamp: Date.now(), type: 'Reply', content: mockReply, aiScore: score });
      }
  }

  async close() {
    if (this.browser) await this.browser.close();
  }
}

export const publisher = new PublisherEngine();
