import React, { useState } from 'react';
import { 
  Brain, 
  Plus, 
  Sparkles, 
  Bookmark, 
  Folder, 
  Clock, 
  Tag, 
  ArrowUpRight, 
  MessageSquareText, 
  TrendingUp, 
  Bell 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MemoryCard {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  type: 'note' | 'web' | 'ai';
}

const SAMPLE_MEMORIES: MemoryCard[] = [
  {
    id: '1',
    title: 'React 19 Server Actions & Optimistic UI Patterns',
    content: 'Notes on implementation details for useOptimistic hook and form actions handling state transitions seamlessly.',
    category: 'Engineering',
    tags: ['React', 'Frontend', 'Architecture'],
    createdAt: '10 mins ago',
    type: 'web',
  },
  {
    id: '2',
    title: 'Vector Embeddings & Semantic Search in Postgres',
    content: 'PGVector index strategies: HNSW vs IVFFlat. HNSW provides higher recall with slight index build time tradeoff.',
    category: 'AI Research',
    tags: ['PostgreSQL', 'Vectors', 'RAG'],
    createdAt: '2 hours ago',
    type: 'ai',
  },
  {
    id: '3',
    title: 'Mnemo Product Design Tokens & Color Palette',
    content: 'Dark mode tokens defined in HSL for background, surface, primary indigo accents, and semantic context feedback states.',
    category: 'Design Systems',
    tags: ['Tailwind', 'CSS', 'UI'],
    createdAt: 'Yesterday',
    type: 'note',
  },
];

export const DashboardPage: React.FC = () => {
  const [quickInput, setQuickInput] = useState('');

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    alert(`Captured Memory: "${quickInput}"`);
    setQuickInput('');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Context Engine Ready
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Welcome back to Mnemo
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Your personal second brain is actively indexing 142 memories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="w-4 h-4 text-text-secondary" />
            <span>Reminders</span>
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">3</span>
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Memory
          </Button>
        </div>
      </div>

      {/* Quick Capture Input Bar */}
      <form onSubmit={handleCapture} className="relative">
        <div className="relative flex items-center bg-surface border border-border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
          <Brain className="w-5 h-5 text-primary ml-4 shrink-0" />
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Store a thought, paste a link, or ask Mnemo to remember something..."
            className="w-full bg-transparent px-4 py-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <div className="pr-3 flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block text-xs text-text-muted px-2 py-1 bg-surface-hover rounded border border-border">
              ⌘ + K
            </span>
            <Button type="submit" size="sm" disabled={!quickInput.trim()}>
              Capture
            </Button>
          </div>
        </div>
      </form>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface border border-border hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Memories</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-text-primary">142</span>
            <span className="text-xs font-medium text-success flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12 this week
            </span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Collections</span>
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Folder className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-text-primary">12</span>
            <span className="text-xs text-text-muted">4 Pinned</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">AI Queries</span>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <MessageSquareText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-text-primary">38</span>
            <span className="text-xs text-text-muted">Active Session</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 rounded-lg bg-warning/10 text-warning">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-text-primary">3</span>
            <span className="text-xs text-warning font-medium">Due Today</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Recent Memories Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent Memories
            </h2>
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {SAMPLE_MEMORIES.map((memory) => (
              <div 
                key={memory.id}
                className="group p-5 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-hover text-text-secondary border border-border">
                    {memory.category}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {memory.createdAt}
                  </span>
                </div>

                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors flex items-center justify-between">
                  {memory.title}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </h3>

                <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                  {memory.content}
                </p>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                  <Tag className="w-3.5 h-3.5 text-text-muted" />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {memory.tags.map((tag) => (
                      <span key={tag} className="text-xs text-text-muted hover:text-text-primary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Column: Quick AI Query & Active Collections */}
        <div className="space-y-6">
          {/* AI Recall Card */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-surface to-accent/10 border border-primary/20 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Ask Mnemo AI</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Query your indexed knowledge base using natural language.
            </p>
            <div className="space-y-2 pt-1">
              <button className="w-full text-left p-2.5 rounded-lg bg-surface/80 hover:bg-surface border border-border text-xs text-text-primary transition-colors flex items-center justify-between group">
                <span>"Summarize my notes on Postgres Vector search"</span>
                <ArrowUpRight className="w-3 h-3 text-text-muted group-hover:text-primary" />
              </button>
              <button className="w-full text-left p-2.5 rounded-lg bg-surface/80 hover:bg-surface border border-border text-xs text-text-primary transition-colors flex items-center justify-between group">
                <span>"What tasks are pending for this week?"</span>
                <ArrowUpRight className="w-3 h-3 text-text-muted group-hover:text-primary" />
              </button>
            </div>
          </div>

          {/* Active Collections Widget */}
          <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Folder className="w-4 h-4 text-accent" />
                Featured Collections
              </h3>
              <span className="text-xs text-text-muted">12 total</span>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Engineering & Architecture', count: 48, color: 'bg-primary' },
                { name: 'AI Research & RAG', count: 32, color: 'bg-accent' },
                { name: 'Design Tokens', count: 18, color: 'bg-secondary' },
                { name: 'Personal & Productivity', count: 14, color: 'bg-success' },
              ].map((col) => (
                <div 
                  key={col.name}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${col.color}`} />
                    <span className="text-xs font-medium text-text-primary">{col.name}</span>
                  </div>
                  <span className="text-xs text-text-muted px-2 py-0.5 bg-background rounded-full border border-border">
                    {col.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;