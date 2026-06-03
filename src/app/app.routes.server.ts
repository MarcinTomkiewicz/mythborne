import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/anti-abuse-cases/:caseId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'game/reports/:reportId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'report/:publicToken',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
