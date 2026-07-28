// src/types/index.ts
export interface MemoryItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  timeAgo: string;
  tags: string[];
  isPriority?: boolean;
  sourceUrl?: string;
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