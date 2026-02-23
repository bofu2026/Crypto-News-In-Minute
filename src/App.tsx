/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Globe, 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock, 
  ExternalLink, 
  RefreshCcw,
  Terminal,
  Layers,
  Cpu
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { fetchWeb3News, NewsItem } from "./services/geminiService";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = [
  { id: "All", icon: Globe },
  { id: "DeFi", icon: Activity },
  { id: "NFT", icon: Zap },
  { id: "L1/L2", icon: Layers },
  { id: "Regulation", icon: Shield },
  { id: "Market", icon: TrendingUp },
];

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [countdown, setCountdown] = useState(60);
  
  const fetchNews = async () => {
    setLoading(true);
    const data = await fetchWeb3News();
    if (data.length > 0) {
      setNews(prev => {
        // Only add unique news items
        const existingIds = new Set(prev.map(item => item.title));
        const newItems = data.filter(item => !existingIds.has(item.title));
        return [...newItems, ...prev].slice(0, 50); // Keep last 50
      });
      setLastUpdate(new Date());
    }
    setLoading(false);
    setCountdown(60);
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchNews();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const filteredNews = selectedCategory === "All" 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden data-grid">
      <div className="scanline pointer-events-none" />
      
      {/* Header / Ticker */}
      <header className="border-b border-[var(--color-line)] bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-accent)] flex items-center justify-center rounded-sm">
              <Terminal size={20} className="text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tighter uppercase italic">
              Web3 Pulse <span className="text-[var(--color-accent)]">Terminal</span>
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-white/40 uppercase">Status:</span>
              <span className="flex items-center gap-1.5 text-[var(--color-accent)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                LIVE_FEED
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 uppercase">Next Update:</span>
              <span className="text-[var(--color-accent)] w-6 text-right">{countdown}s</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 uppercase">Last Sync:</span>
              <span>{lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>

          <button 
            onClick={fetchNews}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCcw size={18} className={cn(loading && "animate-spin")} />
          </button>
        </div>
        
        {/* Price Ticker Mock */}
        <div className="bg-[var(--color-accent)]/10 border-t border-[var(--color-line)] py-1 overflow-hidden whitespace-nowrap">
          <div className="flex gap-12 animate-marquee text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="flex gap-4">
                <span>BTC: $98,432.12 <span className="text-green-400">▲ 2.4%</span></span>
                <span>ETH: $2,841.55 <span className="text-red-400">▼ 0.8%</span></span>
                <span>SOL: $142.20 <span className="text-green-400">▲ 5.1%</span></span>
                <span>GAS: 12 Gwei</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[var(--color-line)] bg-black/40 hidden lg:flex flex-col p-6 gap-8">
          <div>
            <h2 className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-4 font-bold">Categories</h2>
            <nav className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition-all group",
                    selectedCategory === cat.id 
                      ? "bg-[var(--color-accent)] text-black" 
                      : "hover:bg-white/5 text-white/60 hover:text-white"
                  )}
                >
                  <cat.icon size={16} />
                  <span className="flex-1 text-left">{cat.id}</span>
                  {selectedCategory === cat.id && <div className="w-1 h-1 bg-black rounded-full" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto">
            <div className="p-4 border border-[var(--color-line)] rounded-sm bg-black/60">
              <div className="flex items-center gap-2 mb-2">
                <Cpu size={14} className="text-[var(--color-accent)]" />
                <span className="text-[10px] font-bold uppercase">System Info</span>
              </div>
              <div className="space-y-1 text-[10px] text-white/40 uppercase">
                <div className="flex justify-between"><span>Network</span> <span className="text-white">Mainnet</span></div>
                <div className="flex justify-between"><span>Latency</span> <span className="text-white">12ms</span></div>
                <div className="flex justify-between"><span>Uptime</span> <span className="text-white">99.9%</span></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight italic">
                  {selectedCategory === "All" ? "Global Stream" : `${selectedCategory} Feed`}
                </h2>
                <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">
                  Showing {filteredNews.length} verified events
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/40">
                <Clock size={12} />
                Real-time Sync Active
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredNews.length === 0 && !loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 flex flex-col items-center justify-center border border-dashed border-[var(--color-line)] rounded-sm"
                >
                  <p className="text-white/20 uppercase text-xs tracking-widest">No data packets found in this sector</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredNews.map((item, index) => (
                    <motion.article
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative border border-[var(--color-line)] bg-black/40 hover:bg-black/60 transition-all p-5 rounded-sm"
                    >
                      <div className="absolute top-0 left-0 w-[2px] h-0 group-hover:h-full bg-[var(--color-accent)] transition-all duration-300" />
                      
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-white/10 text-white/60 rounded-sm uppercase tracking-wider">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-white/30 font-mono">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-bold group-hover:text-[var(--color-accent)] transition-colors leading-tight">
                            {item.title}
                          </h3>
                          
                          <p className="text-sm text-white/60 leading-relaxed font-sans">
                            {item.summary}
                          </p>
                          
                          <div className="flex items-center gap-4 pt-2">
                            <span className="text-[10px] text-white/40 flex items-center gap-1">
                              Source: <span className="text-white/80">{item.source}</span>
                            </span>
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] text-[var(--color-accent)] hover:underline flex items-center gap-1 uppercase font-bold"
                            >
                              View Source <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                        
                        <div className="hidden md:block">
                           <div className="w-12 h-12 border border-[var(--color-line)] flex items-center justify-center group-hover:border-[var(--color-accent)] transition-colors">
                              <Activity size={20} className="text-white/20 group-hover:text-[var(--color-accent)] transition-colors" />
                           </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </AnimatePresence>
            
            {loading && (
              <div className="space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 bg-white/5 border border-[var(--color-line)] rounded-sm" />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-line);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-accent);
        }
      `}</style>
    </div>
  );
}
