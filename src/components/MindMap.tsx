'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap,
    Node,
    Edge,
    Position,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { store } from '../lib/store';
import { ProblemCluster } from '../lib/types';

// Custom Node to display Pain Intensity and Segment Data
const ClusterNode = ({ data }: any) => {
    return (
        <div className={`px-4 py-2 shadow-xl rounded-md border-2 bg-white text-black min-w-[200px]
            ${data.category === 'Financial' ? 'border-red-500' : 
              data.category === 'Process' ? 'border-yellow-500' : 'border-blue-500'}`}>
            <div className="font-bold text-sm mb-1">{data.label}</div>
            <div className="flex justify-between text-xs text-gray-600 border-t pt-1 mt-1">
                <span>Pain: <strong className={data.pain >= 8 ? 'text-red-600' : ''}>{data.pain.toFixed(1)}/10</strong></span>
                <span>Gap: <strong>{data.gap.toFixed(1)}/10</strong></span>
                <span>Mentions: <strong>{data.mentions}</strong></span>
            </div>
            {data.competitors && data.competitors.length > 0 && (
                 <div className="mt-2 pt-1 border-t text-xs text-red-500 font-semibold">
                    {data.competitors.length} Known Competitors
                 </div>
            )}
        </div>
    );
};

const nodeTypes = {
    cluster: ClusterNode
};

export default function MindMap() {
    // Generate ReactFlow Nodes from Store data
    const generateGraph = () => {
        const clusters = store.getClusters();
        
        // Mock data if store is empty
        const data = clusters.length > 0 ? clusters : MOCK_CLUSTERS;

        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Central Node
        nodes.push({
            id: 'root',
            type: 'default',
            data: { label: '💸 Global Expensive Pains' },
            position: { x: 400, y: 300 },
            style: { 
                background: '#111', 
                color: 'white', 
                border: '2px solid #fff', 
                width: 200, 
                fontSize: 16, 
                fontWeight: 'bold',
                padding: 15
            }
        });

        // Radiate clusters out
        const angleStep = (Math.PI * 2) / data.length;
        const radius = 350;

        data.forEach((cluster, i) => {
            const angle = i * angleStep;
            const x = 400 + radius * Math.cos(angle);
            const y = 300 + radius * Math.sin(angle);

            nodes.push({
                id: cluster.id,
                type: 'cluster',
                position: { x, y },
                data: { 
                    label: cluster.name,
                    pain: cluster.averagePainScore,
                    gap: cluster.averageMarketGap,
                    mentions: cluster.totalMentions,
                    category: cluster.primaryCategory,
                    competitors: cluster.competitors
                }
            });

            // Connect root to cluster
            edges.push({
                id: `e-root-${cluster.id}`,
                source: 'root',
                target: cluster.id,
                animated: cluster.growthVelocity > 1.2, // Pulse if trending
                style: { stroke: '#444', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#444' }
            });

            // Branch out to countries if available
            if (cluster.points && cluster.points.length > 0) {
                const uniqueCountries = Array.from(new Set(cluster.points.filter(p => p.country).map(p => p.country)));
                uniqueCountries.forEach((country, j) => {
                    const countryId = `country_${cluster.id}_${country}`;
                    nodes.push({
                        id: countryId,
                        position: { x: x + 150 * Math.cos(angle + (j * 0.5)), y: y + 150 * Math.sin(angle + (j * 0.5)) },
                        data: { label: `🌍 ${country}` },
                        style: { background: '#f0fdf4', border: '1px solid #16a34a' }
                    });
                    edges.push({
                        id: `e-${cluster.id}-${countryId}`,
                        source: cluster.id,
                        target: countryId,
                        animated: true,
                        style: { stroke: '#16a34a' }
                    });
                });
            }
        });

        return { nodes, edges };
    };

    const graph = useMemo(generateGraph, []);

    return (
        <div className="w-full h-full min-h-[600px] bg-slate-50 rounded-xl overflow-hidden border">
            <ReactFlow 
                nodes={graph.nodes} 
                edges={graph.edges}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#ccc" gap={16} />
                <Controls />
                <MiniMap 
                    nodeColor={(n: any) => {
                        if (n.type === 'cluster') return '#3b82f6';
                        if (n.id === 'root') return '#000';
                        return '#16a34a';
                    }} 
                />
            </ReactFlow>
        </div>
    );
}

// ----------------------------------------------------
// Mock Data for the UI when the Watcher Engine is idle
// ----------------------------------------------------
const MOCK_CLUSTERS: ProblemCluster[] = [
    {
        id: 'c1',
        name: 'SaaS Billing Reconciliation',
        description: 'Syncing Stripe to Quickbooks manually',
        totalMentions: 1240,
        averagePainScore: 8.5,
        averageMarketGap: 9.0,
        primaryCategory: 'Process',
        growthVelocity: 1.5,
        points: [{ id: '1', source: 'X', content: '', url: '', timestamp: 0, country: 'US', metrics: {}, category: 'Process', sentiment: 'Negative', intensityScore: 8, marketGapScore: 9, walletConfidenceScore: 7, jtbd: { functional: '', emotional: '', social: '' }, keywords: [] }],
        competitors: []
    },
    {
        id: 'c2',
        name: 'Automated Cold Email Setup',
        description: 'Domain warmup is failing constantly',
        totalMentions: 4800,
        averagePainScore: 9.2,
        averageMarketGap: 8.1,
        primaryCategory: 'Financial',
        growthVelocity: 2.1,
        points: [{ id: '2', source: 'Reddit', content: '', url: '', timestamp: 0, country: 'UK', metrics: {}, category: 'Financial', sentiment: 'Negative', intensityScore: 9, marketGapScore: 8, walletConfidenceScore: 9, jtbd: { functional: '', emotional: '', social: '' }, keywords: [] }],
        competitors: []
    },
    {
        id: 'c3',
        name: 'Cookie Consent Tracking',
        description: 'Legal fears in the EU',
        totalMentions: 890,
        averagePainScore: 7.4,
        averageMarketGap: 6.5,
        primaryCategory: 'Trust',
        growthVelocity: 0.8,
        points: [{ id: '3', source: 'News', content: '', url: '', timestamp: 0, country: 'DE', metrics: {}, category: 'Trust', sentiment: 'Negative', intensityScore: 7, marketGapScore: 6, walletConfidenceScore: 5, jtbd: { functional: '', emotional: '', social: '' }, keywords: [] }],
        competitors: []
    }
];
