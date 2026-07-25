import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Brain,
  Calendar,
  Tag,
  Clock,
  Bell,
  Star,
  Shuffle,
  Menu,
  Sun,
  Moon,
  User,
  Settings,
  ChevronRight,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Layers,
  LogOut
} from 'lucide-react';

// Data Models
export interface MemoryItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  timeAgo: string;
  tags: string[];
  isPriority?: boolean;
}

export interface ReminderItem {
  id: string;
  title: string;
  dueDate: string;
  dueTime: string;
  category: string;
  isUrgent?: boolean;
  completed?: boolean;
}

// Dummy Data
const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: '1',
    title: 'React 19 Server Actions & Optimistic UI Patterns',
    summary: 'Implementation details for useOptimistic hook and form actions handling state transitions seamlessly.',
    category: 'Engineering',
    date: '2026-07-25',
    timeAgo: 'Today',
    tags: ['React', 'Frontend', 'WebDev'],
    isPriority: true,
  },
  {
    id: '2',
    title: 'Vector Embeddings & Semantic Search in Postgres',
    summary: 'PGVector index strategies: HNSW vs IVFFlat. HNSW provides higher recall with slight index build time tradeoff.',
    category: 'AI Research',
    date: '2026-07-20',
    timeAgo: '5 days ago',
    tags: ['PostgreSQL', 'Vectors', 'RAG'],
    isPriority: true,
  },
  {
    id: '3',
    title: 'Attention Mechanism & Transformer Query-Key Matrices',
    summary: 'Mathematical breakdown of scaled dot-product attention formula and context projections.',
    category: 'AI Research',
    date: '2026-07-15',
    timeAgo: '10 days ago',
    tags: ['Transformers', 'Math', 'LLMs'],
  },
  {
    id: '4',
    title: 'Designing Data-Intensive Applications: Raft vs Paxos',
    summary: 'Analysis of Raft vs Paxos in distributed systems, leader election timeouts, and split-brain prevention.',
    category: 'Books',
    date: '2026-06-30',
    timeAgo: '1 month ago',
    tags: ['Architecture', 'Distributed Systems'],
  },
  {
    id: '5',
    title: 'CSS Container Queries vs Media Queries',
    summary: 'Using container queries for modular micro-frontend components that adapt to parent container size.',
    category: 'Engineering',
    date: '2026-05-12',
    timeAgo: '2 months ago',
    tags: ['CSS', 'Responsive', 'UI'],
  }
];

const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'Review System Design architecture notes for interview prep',
    dueDate: '2026-07-26',
    dueTime: '10:00 AM',
    category: 'Engineering',
    isUrgent: true,
  },
  {
    id: 'rem-2',
    title: 'Re-read Transformer Query-Key Matrices paper before weekly sync',
    dueDate: '2026-07-27',
    dueTime: '02:30 PM',
    category: 'AI Research',
    isUrgent: true,
  },
  {
    id: 'rem-3',
    title: 'Update local Postgres PGVector Docker image',
    dueDate: '2026-07-30',
    dueTime: '06:00 PM',
    category: 'DevOps',
    isUrgent: false,
  }
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Navigation & View State
  const [activeView, setActiveView] = useState<'dashboard' | 'memories' | 'reminders' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Data State
  const [searchQuery, setSearchQuery] = useState('');
  const [memories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [reminders, setReminders] = useState<ReminderItem[]>(INITIAL_REMINDERS);

  // Daily Random Memories (Picks 2 memories for daily rediscovery)
  const dailyForgottenMemories = useMemo(() => {
    return [...memories].sort(() => 0.5 - Math.random()).slice(0, 2);
  }, [memories]);

  // Search Filter
  const searchedMemories = useMemo(() => {
    if (!searchQuery.trim()) return memories;
    const q = searchQuery.toLowerCase().trim();
    return memories.filter((mem) => {
      return (
        mem.title.toLowerCase().includes(q) ||
        mem.summary.toLowerCase().includes(q) ||
        mem.category.toLowerCase().includes(q) ||
        mem.date.includes(q) ||
        mem.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [memories, searchQuery]);

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#0f0f0f] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* AMBIENT BACKGROUND GLOW */}
      {isDark && (
        <div className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      )}

      {/* TOP NAVIGATION BAR (YOUTUBE STYLE) */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 md:px-8 py-3 flex items-center justify-between gap-4 ${
        isDark ? 'bg-[#0f0f0f]/90 border-white/10' : 'bg-white/90 border-slate-200'
      }`}>
        
        {/* Left: Brand Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer shrink-0" 
          onClick={() => {
            setActiveView('dashboard');
            setSearchQuery('');
          }}
        >
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Brain className="w-5 h-5" />
          </div>
          <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Mnemo
          </span>
        </div>

        {/* Center: YouTube-style Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto flex items-center">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories by keyword, tag, or date..."
              className={`w-full border rounded-l-full py-2.5 pl-5 pr-10 text-sm focus:outline-none transition-all ${
                isDark 
                  ? 'bg-[#121212] border-[#303030] text-white placeholder-zinc-500 focus:border-indigo-500' 
                  : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setActiveView('memories')}
            className={`border border-l-0 px-6 py-2.5 rounded-r-full transition-colors flex items-center justify-center shrink-0 ${
              isDark 
                ? 'bg-[#222222] border-[#303030] hover:bg-[#272727] text-zinc-300' 
                : 'bg-slate-200 border-slate-300 hover:bg-slate-300 text-slate-700'
            }`}
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Sidebar Toggle Icon */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
              isDark 
                ? 'bg-[#181818] border-[#303030] hover:bg-[#222222] text-zinc-300' 
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title="Open Menu & Settings"
          >
            <Menu className="w-5 h-5" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
              A
            </div>
          </button>
        </div>
      </header>

      {/* RIGHT SIDEBAR / DRAWER */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer Content */}
          <div className={`relative w-80 max-w-full h-full border-l p-6 flex flex-col justify-between z-10 shadow-2xl transition-all duration-300 ${
            isDark ? 'bg-[#121212] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b pb-4 border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Account Settings</h4>
                    <p className="text-xs text-zinc-400">aarush@example.com</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Appearance Mode
                </label>
                <div className={`grid grid-cols-2 p-1 rounded-xl border ${
                  isDark ? 'bg-black/40 border-zinc-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isDark ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      !isDark ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    Light
                  </button>
                </div>
              </div>

              {/* Sidebar Navigation */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Pages & Views
                </label>

                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeView === 'dashboard' 
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' 
                      : 'hover:bg-zinc-800/50 text-zinc-300'
                  }`}
                >
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span>Dashboard Home</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('memories');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeView === 'memories' 
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' 
                      : 'hover:bg-zinc-800/50 text-zinc-300'
                  }`}
                >
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>All Memories ({memories.length})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('reminders');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeView === 'reminders' 
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' 
                      : 'hover:bg-zinc-800/50 text-zinc-300'
                  }`}
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Reminders & Priority ({reminders.length})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('settings');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeView === 'settings' 
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' 
                      : 'hover:bg-zinc-800/50 text-zinc-300'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account & Profile</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-800">
              <button 
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10 relative z-10">
        
        {/* SEARCH OVERRIDE RESULTS VIEW */}
        {searchQuery.trim() ? (
          <section className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-4 border-zinc-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                <span>Search Results for "{searchQuery}"</span>
              </h2>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-indigo-400 hover:underline"
              >
                Clear Search
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchedMemories.map((mem) => (
                <MemoryCard key={mem.id} mem={mem} isDark={isDark} />
              ))}

              {searchedMemories.length === 0 && (
                <div className="col-span-full py-16 text-center text-zinc-500 text-xs space-y-2">
                  <p>No matching memories found for "{searchQuery}".</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* VIEW 1: MAIN DASHBOARD */}
            {activeView === 'dashboard' && (
              <>
                {/* SECTION 1: REMINDERS & PRIORITY MEMORIES */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                        <Bell className="w-4 h-4" />
                      </div>
                      <h2 className="font-bold text-base tracking-tight">Reminders & Priority Items</h2>
                    </div>

                    <button
                      onClick={() => setActiveView('reminders')}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-all"
                    >
                      <span>View All Reminders</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Active Reminders Quick List */}
                    <div className={`lg:col-span-1 p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                      isDark ? 'bg-[#141414] border-[#262626]' : 'bg-white border-slate-200'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          <span>Upcoming Deadlines</span>
                          <span className="text-amber-400">{reminders.length} Active</span>
                        </div>

                        <div className="space-y-2.5">
                          {reminders.slice(0, 3).map((r) => (
                            <div
                              key={r.id}
                              onClick={() => toggleReminder(r.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                                r.completed
                                  ? 'opacity-50 line-through bg-zinc-900/40 border-zinc-800'
                                  : isDark 
                                    ? 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-amber-500/30' 
                                    : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${
                                r.completed ? 'text-emerald-400' : 'text-zinc-500'
                              }`} />
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{r.title}</p>
                                <p className="text-[10px] text-zinc-500 font-mono">
                                  Due: {r.dueDate} at {r.dueTime}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveView('reminders')}
                        className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl transition-all"
                      >
                        Manage All Reminders
                      </button>
                    </div>

                    {/* Priority Memories */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {memories.filter((m) => m.isPriority).map((mem) => (
                        <MemoryCard key={mem.id} mem={mem} isDark={isDark} />
                      ))}
                    </div>
                  </div>
                </section>

                {/* SECTION 2: DAILY DISCOVERY / FORGOTTEN MEMORIES */}
                <section className="space-y-4 pt-4">
                  <div className="flex items-center justify-between border-b pb-3 border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                        <Shuffle className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-bold text-base tracking-tight">Daily Discovery (Forgotten Memories)</h2>
                        <p className="text-xs text-zinc-400">Randomly picked from your vault to trigger active recall.</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveView('memories')}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-all"
                    >
                      <span>Explore All Vault</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dailyForgottenMemories.map((mem) => (
                      <div
                        key={'daily-' + mem.id}
                        className={`p-5 rounded-2xl border space-y-3 relative overflow-hidden transition-all group ${
                          isDark 
                            ? 'bg-gradient-to-br from-[#161320] via-[#121212] to-[#121212] border-purple-500/30 hover:border-purple-500/60' 
                            : 'bg-gradient-to-br from-purple-50 via-white to-white border-purple-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            Daily Recall
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">{mem.date}</span>
                        </div>

                        <h3 className="font-bold text-sm group-hover:text-purple-300 transition-colors">
                          {mem.title}
                        </h3>

                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                          {mem.summary}
                        </p>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/50">
                          <span>Category: {mem.category}</span>
                          <span className="text-purple-400 hover:underline cursor-pointer" onClick={() => setActiveView('memories')}>
                            Open memory →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* VIEW 2: ALL MEMORIES PAGE */}
            {activeView === 'memories' && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b pb-4 border-zinc-800">
                  <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-400" />
                      <span>All Memories Vault</span>
                    </h1>
                    <p className="text-xs text-zinc-400">Total {memories.length} indexed knowledge cards in your second brain.</p>
                  </div>

                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    ← Back to Dashboard
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {memories.map((mem) => (
                    <MemoryCard key={mem.id} mem={mem} isDark={isDark} />
                  ))}
                </div>
              </section>
            )}

            {/* VIEW 3: REMINDERS PAGE */}
            {activeView === 'reminders' && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b pb-4 border-zinc-800">
                  <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-400" />
                      <span>Scheduled Reminders</span>
                    </h1>
                    <p className="text-xs text-zinc-400">Track tasks and review schedules across your memory base.</p>
                  </div>

                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    ← Back to Dashboard
                  </button>
                </div>

                <div className="space-y-3">
                  {reminders.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => toggleReminder(r.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        r.completed
                          ? 'opacity-50 line-through bg-zinc-900/40 border-zinc-800'
                          : isDark
                            ? 'bg-[#141414] border-[#262626] hover:border-amber-500/40'
                            : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className={`w-5 h-5 ${r.completed ? 'text-emerald-400' : 'text-zinc-500'}`} />
                        <div>
                          <p className="text-sm font-semibold">{r.title}</p>
                          <p className="text-xs text-zinc-400 font-mono">
                            Due {r.dueDate} at {r.dueTime} • Category: {r.category}
                          </p>
                        </div>
                      </div>

                      <span className={`text-xs px-2.5 py-1 rounded-full border ${
                        r.isUrgent ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}>
                        {r.isUrgent ? 'High Priority' : 'Normal'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* VIEW 4: ACCOUNT SETTINGS PAGE */}
            {activeView === 'settings' && (
              <section className="space-y-6 max-w-2xl animate-in fade-in duration-200">
                <div className="border-b pb-4 border-zinc-800 flex items-center justify-between">
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-400" />
                    <span>Account Settings</span>
                  </h1>
                  <button onClick={() => setActiveView('dashboard')} className="text-xs text-indigo-400 hover:underline">
                    ← Back to Dashboard
                  </button>
                </div>

                <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-[#141414] border-[#262626]' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white">
                      A
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Aarush Gupta</h3>
                      <p className="text-xs text-zinc-400">aarush@example.com</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">Theme Preferences</span>
                      <button 
                        onClick={() => setTheme(isDark ? 'light' : 'dark')}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                      >
                        Switch to {isDark ? 'Light' : 'Dark'} Theme
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

      </main>
    </div>
  );
};

// HELPER COMPONENT: MEMORY CARD
const MemoryCard: React.FC<{ mem: MemoryItem; isDark: boolean }> = ({ mem, isDark }) => (
  <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all duration-200 group hover:shadow-xl ${
    isDark 
      ? 'bg-[#141414] border-[#262626] hover:border-indigo-500/40 hover:shadow-indigo-500/5' 
      : 'bg-white border-slate-200 hover:border-indigo-300'
  }`}>
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
          {mem.category}
        </span>
        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-mono">
          <Calendar className="w-3 h-3 text-zinc-500" />
          <span>{mem.date}</span>
        </div>
      </div>

      <h3 className="font-semibold text-sm group-hover:text-indigo-300 transition-colors line-clamp-2">
        {mem.title}
      </h3>

      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
        {mem.summary}
      </p>
    </div>

    <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
      <div className="flex items-center gap-1 overflow-hidden">
        {mem.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] text-zinc-400 bg-zinc-800/60 border border-zinc-700/50 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0"
          >
            <Tag className="w-2.5 h-2.5 text-zinc-500" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1 text-[11px] text-zinc-500 shrink-0 font-mono">
        <Clock className="w-3 h-3" />
        <span>{mem.timeAgo}</span>
      </div>
    </div>
  </div>
);

export default DashboardPage;