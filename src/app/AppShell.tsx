import React from 'react';
import { Outlet } from 'react-router-dom';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary antialiased font-sans selection:bg-primary/20 selection:text-primary">
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-text-muted font-medium tracking-wide uppercase">
                Initializing RememberAI...
              </span>
            </div>
          </div>
        }
      >
        <Outlet />
      </React.Suspense>
    </div>
  );
};