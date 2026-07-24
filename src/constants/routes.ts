export const ROUTES = {
  LANDING: '/',
  APP: {
    ROOT: '/app',
    DASHBOARD: '/app/dashboard',
    MEMORIES: {
      ROOT: '/app/memories',
      DETAILS: (id: string = ':memoryId') => `/app/memories/${id}`,
    },
    SEARCH: '/app/search',
    REMINDERS: '/app/reminders',
    COLLECTIONS: {
      ROOT: '/app/collections',
      DETAILS: (id: string = ':collectionId') => `/app/collections/${id}`,
    },
    CHAT: {
      ROOT: '/app/chat',
      SESSION: (id: string = ':sessionId') => `/app/chat/${id}`,
    },
    ANALYTICS: '/app/analytics',
    SETTINGS: {
      ROOT: '/app/settings',
      PROFILE: '/app/settings/profile',
      APPEARANCE: '/app/settings/appearance',
      NOTIFICATIONS: '/app/settings/notifications',
      PRIVACY: '/app/settings/privacy',
      EXTENSION: '/app/settings/extension',
      SHORTCUTS: '/app/settings/shortcuts',
      ACCOUNT: '/app/settings/account',
    },
    HELP: '/app/help',
  },
} as const;