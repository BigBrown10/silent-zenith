'use client';

import React, { useState } from 'react';
import MindMap from '../components/MindMap';
import BubbleMap from '../components/BubbleMap';
import { watcher } from '../agents/watcher';
import { store } from '../lib/store';
import { ProblemCluster } from '../lib/types';
import { Activity, BrainCircuit, Globe, Play, Square, Users, Zap } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'mindmap' | 'bubblemap' | 'dealflow'>('bubblemap');
  const [isWatching, setIsWatching] = useState(false);
  const [clusters, setClusters] = useState<ProblemCluster[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Simulation of the Watcher Engine running
  const toggleWatcher = async () => {
    if (isWatching) {
      watcher.stop();
      setIsWatching(false);
      logEvent('Terminated Watcher Engine.');
    } else {
      setIsWatching(true);
      logEvent('Initiating Global Pain Sweep across X, Reddit, and News...');
      
      // Pass a callback to the store or poll it in a real app.
      // For this demo, we'll emulate the store filling up.
      await watcher.start(['SaaS billing', 'cold email', 'compliance tool']);
      
      // Update local state with the newly found clusters from the mocked scrapers
      setTimeout(() => {
          setClusters(store.getClusters());
          logEvent(`Sweep complete. Found ${store.getClusters().length} high-intensity pain clusters.`);
      }, 2000);
    }
  };

  const logEvent = (msg: string) => {
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-red-500">
                <BrainCircuit size={28} />
                <h1 className="text-2xl font-black tracking-tighter text-white">PROVALE<span className="text-red-500 text-sm tracking-widest ml-2 align-top">PROTOCOL</span></h1>
            </div>
            
            <div className="flex items-center space-x-4">
                <button 
                    onClick={toggleWatcher}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md font-bold text-sm transition-all shadow-lg ${isWatching ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' : 'bg-green-500 text-black hover:bg-green-400 border border-green-500'}`}
                >
                    {isWatching ? <><Square size={16} className="fill-current" /> <span>Halt Watcher</span></> : <><Play size={16} className="fill-current" /> <span>Deploy Watcher</span></>}
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-12 gap-6 mt-4">
        
        {/* Left Sidebar - Logs & Intelligence */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
            
            {/* Engine Status */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-1 ${isWatching ? 'bg-green-500 animate-pulse' : 'bg-gray-800'}`}></div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center"><Activity size={16} className="mr-2" /> Agent Status</h2>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Watcher Engine</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${isWatching ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                            {isWatching ? 'ACTIVE' : 'IDLE'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Publisher Engine</span>
                        <span className="px-2 py-1 rounded text-xs font-bold bg-gray-800 text-gray-500">IDLE</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Active Clusters</span>
                        <span className="font-mono text-xl font-bold">{clusters.length}</span>
                    </div>
                </div>
            </div>

            {/* Live Terminal */}
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 h-[400px] font-mono text-xs flex flex-col">
                 <h2 className="text-sm font-bold text-gray-500 mb-2 truncate">TERMINAL //</h2>
                 <div className="flex-1 overflow-y-auto space-y-2 text-gray-400">
                    {logs.map((log, i) => (
                        <div key={i} className={i === 0 ? 'text-green-400' : ''}>{log}</div>
                    ))}
                    {logs.length === 0 && <div className="text-gray-600 italic">System idle. Awaiting deployment.</div>}
                 </div>
            </div>
        </div>

        {/* Center Canvas - Visualizations */}
        <div className="col-span-12 lg:col-span-9 flex flex-col">
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg w-fit mb-4 border border-gray-800">
                <button 
                    onClick={() => setActiveTab('bubblemap')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center space-x-2 transition-colors ${activeTab === 'bubblemap' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Globe size={16} /> <span>Bubble Map</span>
                </button>
                <button 
                    onClick={() => setActiveTab('mindmap')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center space-x-2 transition-colors ${activeTab === 'mindmap' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Zap size={16} /> <span>Problem Mind Map</span>
                </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 min-h-[600px] w-full relative">
                {activeTab === 'mindmap' && (
                    <div className="absolute inset-0 animate-in fade-in duration-300">
                        <MindMap />
                    </div>
                )}
                {activeTab === 'bubblemap' && (
                    <div className="absolute inset-0 animate-in fade-in duration-300">
                        <BubbleMap data={clusters.length > 0 ? clusters : []} />
                        {clusters.length === 0 && !isWatching && (
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                 <div className="text-center bg-black/80 p-6 rounded-xl border border-gray-800 backdrop-blur-sm">
                                     <Globe size={48} className="mx-auto text-gray-600 mb-4" />
                                     <h3 className="text-xl font-bold text-gray-300 mb-2">No Market Data Available</h3>
                                     <p className="text-sm text-gray-500">Deploy the Watcher Engine to scan the web for expensive problems.</p>
                                 </div>
                             </div>
                        )}
                    </div>
                )}
            </div>

        </div>
      </main>
    </div>
  );
}
