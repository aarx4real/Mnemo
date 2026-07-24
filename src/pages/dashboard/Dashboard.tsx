import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  Search,
  Zap,
  BookOpen,
  Clock,
  ChevronRight,
  Compass,
  Layers,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Folder,
  Send,
  FileText,
  Plus,
  Command,
  X,
  Bot,
  Activity,
  TrendingUp,
  Bookmark,
  Share2,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickCaptureModal, NewMemoryData } from '@/components/dashboard/QuickCaptureModal';

interface MemoryItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  timeAgo: string;
  aiConfidence: number;
  decayDaysLeft: number;
  tags: string[];
  isPinned?: boolean;
}

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    title: 'React 19 Server Actions & Optimistic UI Patterns',
    summary: 'Implementation details for useOptimistic hook and form actions handling state transitions seamlessly without blocking spinners.',
    category: 'Engineering',
    source: 'GitHub / RFC-419',
    timeAgo: '12m ago',
    aiConfidence: 98,
    decayDaysLeft: 14,
    tags: ['React', 'Frontend', 'Architecture'],
    isPinned: true,
  },
  {
    id: 'mem-2',
    title: 'Vector Embeddings & Semantic Search in Postgres',
    summary: 'PGVector index strategies: HNSW vs IVFFlat. HNSW provides higher recall with slight index build time tradeoff.',
    category: 'AI Research',
    source: 'arxiv.org/abs/2308.11',
    timeAgo: '2h ago',
    aiConfidence: 94,
    decayDaysLeft: 3,
    tags: ['PostgreSQL', 'Vectors', 'RAG'],
  },
  {
    id: 'mem-3',
    title: 'Attention Mechanism & Transformer Query-Key Matrices',
    summary: 'Mathematical breakdown of scaled dot-product attention formula Softmax((QK^T)/sqrt(d_k))V and context projections.',
    category: 'AI Research',
    source: 'Notion Import',
    timeAgo: '1d ago',
    aiConfidence: 91,
    decayDaysLeft: 21,
    tags: ['Transformers', 'Math', 'LLMs'],
  },
  {
    id: 'mem-4',
    title: 'Designing Data-Intensive Applications: Consensus Algorithms',
    summary: 'Analysis of Raft vs Paxos in distributed systems, leader election timeouts, and split-brain prevention.',
    category: 'Books',
    source: 'O\'Reilly Reader',
    timeAgo: '3d ago',
    aiConfidence: 89,
    decayDaysLeft: 5,
    tags: ['Distributed Systems', 'Database', 'Architecture'],
  }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Core States
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem('mnemo_memories');
    return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
  });

  const [activeBriefTab, setActiveBriefTab] = useState<'synthesis' | 'retention' | 'focus'>('synthesis');
  const [searchScope, setSearchScope] = useState<'all' | 'research' | 'code' | 'books'>('all');
  const [query, setQuery] = useState('');
  
  // Modals & AI State
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [aiSynthesisResponse, setAiSynthesisResponse] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // User details
  const storedUser = JSON.parse(localStorage.getItem('mnemo_user') || '{"name": "Aarush Gupta"}');
  const firstName = storedUser.name ? storedUser.name.split(' ')[0] : 'Aarush';

  // Persist to local storage on memory update
  useEffect(() => {
    localStorage.setItem('mnemo_memories', JSON.stringify(memories));
  }, [memories]);

  // Keyboard Listener (⌘K for Search, ⌘N for Capture)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsCaptureModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save Capture Handler
  const handleSaveMemory = (newMem: NewMemoryData) => {
    const item: MemoryItem = {
      id: 'mem-' + Date.now(),
      title: newMem.title,
      summary: newMem.summary,
      category: newMem.category,
      source: newMem.source,
      timeAgo: 'Just now',
      aiConfidence: 99,
      decayDaysLeft: 30,
      tags: newMem.tags,
    };

    setMemories((prev) => [item, ...prev]);
  };

  // AI Synthesis Trigger
  const handleSynthesize = () => {
    if (!query.trim()) return;
    setIsSynthesizing(true);
    setAiSynthesisResponse(null);

    setTimeout(() => {
      setIsSynthesizing(false);
      setAiSynthesisResponse(
        `Synthesized knowledge across ${filteredMemories.length} indexed items for "${query}":\n\n` +
        `• Core Finding: Matches primary entries in ${searchScope === 'all' ? 'Engineering & Research' : searchScope}.\n` +
        `• Direct Insight: Your memory index suggests referencing optimistic UI patterns alongside vector embeddings to optimize real-time querying.\n` +
        `• Retention Status: All associated memories are above 85% neural retention.`
      );
    }, 750);
  };

  // Memory Filter Calculation
  const filteredMemories = memories.filter((mem) => {
    if (searchScope === 'research' && mem.category !== 'AI Research' && mem.category !== 'Deep Learning') return false;
    if (searchScope === 'code' && mem.category !== 'Engineering') return false;
    if (searchScope === 'books' && mem.category !== 'Books') return false;

    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      mem.title.toLowerCase().includes(q) ||
      mem.summary.toLowerCase().includes(q) ||
      mem.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* BACKGROUND AMBIENT LIGHTS */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[400px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070B]/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/app/dashboard')}>
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-indigo-400 shadow-inner">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Mnemo</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Neural Engine Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCaptureModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Capture</span>
            <kbd className="hidden md:inline-block text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90">⌘N</kbd>
          </Button>

          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-semibold text-xs text-white shadow-md">
            {firstName.charAt(0)}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* HERO BRIEFING & SYNTHESIZER BAR */}
        <section className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent p-6 lg:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden space-y-6">
          
          {/* Header Greeting & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Morning Briefing</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Good morning, {firstName}. Here is your neural summary.
              </h1>
            </div>

            {/* Briefing Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl text-xs font-medium">
              <button
                onClick={() => setActiveBriefTab('synthesis')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeBriefTab === 'synthesis' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Daily Synthesis
              </button>
              <button
                onClick={() => setActiveBriefTab('retention')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeBriefTab === 'retention' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Retention Gaps
              </button>
              <button
                onClick={() => setActiveBriefTab('focus')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeBriefTab === 'focus' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Suggested Focus
              </button>
            </div>
          </div>

          {/* BRIEFING CARD CONTENT AREA */}
          {activeBriefTab === 'synthesis' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Activity className="w-4 h-4" />
                  <span>Index Growth</span>
                </div>
                <p className="text-xl font-bold text-white">{memories.length} Memories</p>
                <p className="text-slate-400 text-[11px]">Synced across your neural knowledge base.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Memory Health</span>
                </div>
                <p className="text-xl font-bold text-white">94% Retention</p>
                <p className="text-slate-400 text-[11px]">Spaced repetition schedule optimal.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Flame className="w-4 h-4" />
                  <span>Learning Streak</span>
                </div>
                <p className="text-xl font-bold text-white">12 Days</p>
                <p className="text-slate-400 text-[11px]">Consistent indexing & quick captures.</p>
              </div>
            </div>
          )}

          {activeBriefTab === 'retention' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-white">Vector Search Indexes memory is decaying</p>
                  <p className="text-amber-300/80 text-[11px]">Memory memory retention dropped to 62%. Recommended review due today.</p>
                </div>
              </div>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl">
                Review Now
              </Button>
            </div>
          )}

          {activeBriefTab === 'focus' && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <p className="font-bold text-white">Focus Target: Master React 19 State Optimizations</p>
                  <p className="text-indigo-300/80 text-[11px]">You spent 3 hours researching server actions this week.</p>
                </div>
              </div>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl">
                Open Reader
              </Button>
            </div>
          )}

          {/* UNIVERSAL SYNTHESIZER SEARCH INPUT */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-indigo-400 absolute left-4 pointer-events-none" />

              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSynthesize()}
                placeholder="Ask Mnemo anything or filter memories (Press ⌘K to focus)..."
                className="w-full bg-black/60 border border-white/15 rounded-2xl pl-12 pr-36 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
              />

              <div className="absolute right-3 flex items-center gap-2">
                <Button
                  onClick={handleSynthesize}
                  disabled={isSynthesizing || !query.trim()}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl px-3 py-1.5 gap-1.5"
                >
                  <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize'}</span>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Scope Filter Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[11px] font-medium text-slate-500 mr-1">Scope:</span>
                {(['all', 'research', 'code', 'books'] as const).map((scope) => (
                  <button
                    key={scope}
                    onClick={() => setSearchScope(scope)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                      searchScope === scope
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {scope}
                  </button>
                ))}
              </div>

              <div className="hidden lg:flex items-center gap-2 text-slate-500 text-[11px]">
                <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-slate-400">
                  <Command className="w-3 h-3" /> K
                </span>
                <span>search</span>
                <span>•</span>
                <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-slate-400">
                  <Command className="w-3 h-3" /> N
                </span>
                <span>capture</span>
              </div>
            </div>

            {/* AI SYNTHESIS RESULT BOX */}
            {aiSynthesisResponse && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-100 space-y-2 relative animate-in fade-in duration-200">
                <button
                  onClick={() => setAiSynthesisResponse(null)}
                  className="absolute top-3 right-3 text-indigo-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 font-bold text-indigo-400">
                  <Bot className="w-4 h-4" />
                  <span>Mnemo AI Synthesis Result</span>
                </div>

                <p className="whitespace-pre-line text-slate-300 leading-relaxed font-mono">
                  {aiSynthesisResponse}
                </p>
              </div>
            )}
          </div>

        </section>

        {/* INDEXED MEMORIES GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold tracking-tight text-white uppercase">
                Indexed Memories ({filteredMemories.length})
              </h3>
            </div>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-indigo-400 hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMemories.map((mem) => (
              <div
                key={mem.id}
                className="p-5 rounded-2xl bg-[#0B0F17] border border-white/10 hover:border-indigo-500/30 transition-all space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                      {mem.category}
                    </span>
                    <span className="text-[11px] text-slate-500">{mem.timeAgo}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {mem.title}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {mem.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {mem.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                    {mem.aiConfidence}% match
                  </span>
                </div>
              </div>
            ))}

            {filteredMemories.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs space-y-2">
                <Search className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                <p>No indexed memories match your search query or scope filter.</p>
              </div>
            )}
          </div>
        </section>

        {/* FOOTER BADGE */}
        <footer className="border-t border-white/10 pt-6 text-center text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mnemo Neural Database Syncing</span>
          </div>
          <span>Version 2.4.0 • Step 1 Active</span>
        </footer>

      </main>

      {/* QUICK CAPTURE MODAL */}
      <QuickCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onSave={handleSaveMemory}
      />

    </div>
  );
};

export default Dashboard;