import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { ROUTES } from '@/constants/routes';

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 space-y-4">
    <div className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
      Phase 1 Shell Active
    </div>
    <h1 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
    <p className="text-text-secondary text-sm">
      Route infrastructure working cleanly. Page component pending implementation.
    </p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: (
      <div className="p-8 text-error">
        <h2 className="text-xl font-bold">Route Error Encountered</h2>
      </div>
    ),
    children: [
      {
        index: true,
        element: <Placeholder title="Landing Page" />,
      },
      {
        path: ROUTES.APP.ROOT,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.APP.DASHBOARD} replace />,
          },
          {
            path: 'dashboard',
            element: <Placeholder title="Dashboard Page" />,
          },
          {
            path: 'memories',
            element: <Placeholder title="Memories Page" />,
          },
          {
            path: 'memories/:memoryId',
            element: <Placeholder title="Memory Details Page" />,
          },
          {
            path: 'search',
            element: <Placeholder title="Search Page" />,
          },
          {
            path: 'reminders',
            element: <Placeholder title="Reminders Page" />,
          },
          {
            path: 'collections',
            element: <Placeholder title="Collections Page" />,
          },
          {
            path: 'collections/:collectionId',
            element: <Placeholder title="Collection Details Page" />,
          },
          {
            path: 'chat',
            element: <Placeholder title="AI Chat Page" />,
          },
          {
            path: 'chat/:sessionId',
            element: <Placeholder title="AI Chat Session Page" />,
          },
          {
            path: 'analytics',
            element: <Placeholder title="Analytics Page" />,
          },
          {
            path: 'settings/*',
            element: <Placeholder title="Settings Shell" />,
          },
          {
            path: 'help',
            element: <Placeholder title="Help Center Page" />,
          },
        ],
      },
      {
        path: '*',
        element: <Placeholder title="404 Not Found" />,
      },
    ],
  },
]);