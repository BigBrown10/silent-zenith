'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ProblemCluster } from '../lib/types';

interface BubbleMapProps {
    data: ProblemCluster[];
}

export default function BubbleMap({ data }: BubbleMapProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || data.length === 0) return;

        const width = svgRef.current.parentElement?.clientWidth || 800;
        const height = 600;

        // Clear previous render
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height]);

        // Tooltip setup
        const tooltip = d3.select('body').append('div')
            .style('position', 'absolute')
            .style('background', '#fff')
            .style('padding', '10px')
            .style('border', '1px solid #ccc')
            .style('border-radius', '8px')
            .style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', 50);

        // Color scale based on Sentiment/Category
        const colorScale = d3.scaleOrdinal()
            .domain(['Financial', 'Process', 'Productivity', 'Trust', 'Unknown'])
            .range(['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#9ca3af']);

        // Size scale based on Mentions
        const sizeScale = d3.scaleSqrt()
            .domain([0, d3.max(data, d => d.totalMentions) || 1000])
            .range([20, 100]); // min/max radius

        // Simulation
        const simulation = d3.forceSimulation(data as d3.SimulationNodeDatum[])
            .force('charge', d3.forceManyBody().strength(5))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius((d: any) => sizeScale(d.totalMentions as number) + 5));

        // SVG Groups mapping
        const node = svg.append('g')
            .selectAll<SVGGElement, any>('g')
            .data(data as any[])
            .join('g')
            .call(d3.drag<SVGGElement, any>()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended)
            );

        // Velocity Pulsing Ring (The "Trending Now" indicator based on growthVelocity)
        node.filter(d => d.growthVelocity > 1.2)
            .append('circle')
            .attr('r', d => sizeScale(d.totalMentions))
            .style('fill', 'none')
            .style('stroke', d => colorScale(d.primaryCategory) as string)
            .style('stroke-width', 4)
            .style('opacity', 0.5)
            .attr('class', 'pulse-ring');

        // Main Bubble
        node.append('circle')
            .attr('r', d => sizeScale(d.totalMentions))
            .style('fill', d => colorScale(d.primaryCategory) as string)
            .style('opacity', 0.8)
            .style('stroke', '#fff')
            .style('stroke-width', 2);

        // Label
        node.append('text')
            .text(d => d.name)
            .attr('text-anchor', 'middle')
            .style('fill', '#fff')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none')
            .attr('dy', '0.3em');

        // Tooltip Interactions
        node.on('mouseover', (event, d) => {
                d3.select(event.currentTarget).select('circle').style('opacity', 1).style('stroke', '#000');
                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(`
                    <strong>${d.name}</strong><br/>
                    <span class="text-xs text-gray-500">${d.description}</span><br/><br/>
                    📉 Pain Score: ${d.averagePainScore.toFixed(1)}/10<br/>
                    📊 Mentions: ${d.totalMentions.toLocaleString()}<br/>
                    🚀 Growth Velocity: ${d.growthVelocity}x<br/>
                    💸 Market Gap: ${d.averageMarketGap.toFixed(1)}/10
                `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 28) + 'px');
            })
            .on('mousemove', (event) => {
                tooltip.style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', (event) => {
                d3.select(event.currentTarget).select('circle').style('opacity', 0.8).style('stroke', '#fff');
                tooltip.transition().duration(500).style('opacity', 0);
            })
            .on('click', (event, d) => {
                console.log('Drill down into cluster:', d.id);
            });

        // Ticker
        simulation.on('tick', () => {
            node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
        });

        // Drag functions
        function dragstarted(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return () => {
             // Cleanup tooltip on unmount
             d3.select('body').selectAll('div').filter(function() {
                 return d3.select(this).style('position') === 'absolute' && d3.select(this).style('z-index') === '50';
             }).remove();
        };

    }, [data]);

    return (
        <div className="w-full relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.15); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
                :global(.pulse-ring) {
                    animation: pulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
                    transform-origin: center;
                }
            `}</style>
            
            <div className="absolute top-4 left-4 z-10 text-white">
                <h2 className="text-xl font-bold">Trending Pain Market</h2>
                <p className="text-xs text-gray-400">Bubble size = Mention volume. Pulsing = Currently trending.</p>
            </div>
            
            <svg ref={svgRef} className="w-full h-full min-h-[600px] cursor-grab active:cursor-grabbing" />
            
            {/* Embedded Profitability Overlay Toggle (Mock) */}
            <div className="absolute bottom-4 right-4 z-10 bg-black/50 p-3 rounded-lg backdrop-blur-md border border-gray-700">
                 <label className="flex items-center space-x-2 text-white text-sm cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-500 focus:ring-2" />
                    <span>Overlay Profitability Matrix ($TAM)</span>
                 </label>
            </div>
        </div>
    );
}
