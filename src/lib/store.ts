import { AnalyzedPain, ProblemCluster, Lead, Competitor } from './types';

// Simple in-memory store for prototyping.
// In a real app, this would be a database like PostgreSQL or Supabase.

class ProvaleStore {
  private pains: AnalyzedPain[] = [];
  private clusters: ProblemCluster[] = [];
  private leads: Lead[] = [];
  private competitors: Competitor[] = [];

  // Pains
  addPain(pain: AnalyzedPain) {
    this.pains.push(pain);
    this.updateClusters(pain);
  }

  getPains(): AnalyzedPain[] {
    return this.pains;
  }

  // Clusters (The Bubble Map Data)
  getClusters(): ProblemCluster[] {
    return this.clusters;
  }

  getCluster(id: string): ProblemCluster | undefined {
    return this.clusters.find(c => c.id === id);
  }

  private updateClusters(newPain: AnalyzedPain) {
    // Basic clustering logic: Find a cluster with matching keywords
    const match = this.clusters.find(c => 
      c.points[0]?.keywords.some(k => newPain.keywords.includes(k))
    );

    if (match) {
      match.points.push(newPain);
      match.totalMentions++;
      // Recalculate averages
      match.averagePainScore = match.points.reduce((sum, p) => sum + p.intensityScore, 0) / match.points.length;
      match.averageMarketGap = match.points.reduce((sum, p) => sum + p.marketGapScore, 0) / match.points.length;
    } else {
      // Create new cluster
      const newCluster: ProblemCluster = {
        id: `cluster_${Date.now()}`,
        name: `Problem Domain: ${newPain.keywords[0] || 'Unknown'}`,
        description: `Issues related to ${newPain.keywords.join(', ')}`,
        totalMentions: 1,
        averagePainScore: newPain.intensityScore,
        averageMarketGap: newPain.marketGapScore,
        primaryCategory: newPain.category,
        growthVelocity: 1.0, // Initial velocity
        points: [newPain],
        competitors: [] // Will be populated by Ghost Tracker
      };
      this.clusters.push(newCluster);
    }
  }

  // Leads (Outreach Engine)
  addLead(lead: Lead) {
    this.leads.push(lead);
  }

  getLeadsByStatus(status: Lead['status']): Lead[] {
    return this.leads.filter(l => l.status === status);
  }

  updateLeadStatus(id: string, status: Lead['status']) {
    const lead = this.leads.find(l => l.id === id);
    if (lead) lead.status = status;
  }

  // Competitors
  addCompetitor(comp: Competitor, clusterId: string) {
    this.competitors.push(comp);
    const cluster = this.getCluster(clusterId);
    if (cluster && !cluster.competitors.find(c => c.id === comp.id)) {
        cluster.competitors.push(comp);
    }
  }
}

export const store = new ProvaleStore();
