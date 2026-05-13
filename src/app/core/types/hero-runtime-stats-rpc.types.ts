import { Database } from './database.types';

export type GetHeroDashboardRuntimeStatsRpcArgs =
  Database['public']['Functions']['get_hero_dashboard_runtime_stats']['Args'];
export type GetHeroDashboardRuntimeStatsRpcRow =
  Database['public']['Functions']['get_hero_dashboard_runtime_stats']['Returns'][number];

export type GetHeroHealthStateRpcArgs =
  Database['public']['Functions']['get_hero_health_state']['Args'];
export type GetHeroHealthStateRpcRow =
  Database['public']['Functions']['get_hero_health_state']['Returns'][number];
