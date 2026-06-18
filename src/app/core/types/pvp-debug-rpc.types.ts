import { Database } from './database.types';

type Rpc<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];

export type AddHeroRemainingActionsRpcArgs =
  Rpc<'add_hero_remaining_actions'>['Args'];
export type AddHeroRemainingActionsRpcRow =
  Rpc<'add_hero_remaining_actions'>['Returns'][number];

export type SkipActivePvpAttackTravelTimerRpcArgs =
  Rpc<'skip_active_pvp_attack_travel_timer'>['Args'];
export type SkipActivePvpAttackTravelTimerRpcRow =
  Rpc<'skip_active_pvp_attack_travel_timer'>['Returns'][number];
