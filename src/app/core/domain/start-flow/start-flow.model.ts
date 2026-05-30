import { Json, Database } from '../../types/database.types';
import { Origin } from '../origin/origin.model';

type RpcRows<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T]['Returns'];

type RpcRow<T extends keyof Database['public']['Functions']> =
  RpcRows<T> extends readonly (infer Row)[] ? Row : never;

export type StartFlowServerAvailabilityRow =
  RpcRow<'get_start_flow_server_availability'>;
export type StartFlowOriginOptionRow =
  RpcRow<'get_start_flow_origin_options'>;
export type AccountEntryHeroContextRow =
  RpcRow<'get_account_entry_hero_contexts'>;
export type AccountEntryActiveHeroContextRow =
  RpcRow<'select_account_entry_active_hero_context'>;
export type SelectAccountEntryActiveHeroContextArgs =
  Database['public']['Functions']['select_account_entry_active_hero_context']['Args'];
export type StartFlowCreateHeroArgs =
  Database['public']['Functions']['create_hero_start_flow']['Args'];
export type StartFlowCreateHeroRow = RpcRow<'create_hero_start_flow'>;

export interface StartFlowServerAvailability {
  serverId: string;
  serverKey: string;
  serverName: string;
  serverKind: string;
  serverStatus: string;
  description: string;
  membershipStatus: string;
  isVisible: boolean;
  isStandard: boolean;
  isSandbox: boolean;
  isStaffContext: boolean;
  canEnterGame: boolean;
  canCreateHero: boolean;
  nextAction: string;
  blockReason: string | null;
  userHeroCount: number;
  defaultHeroId: string | null;
  defaultHeroName: string | null;
  isServerFull: boolean;
  isDistrictAFull: boolean;
  districtACapacity: number;
  districtAOccupied: number;
  districtAFree: number;
  heroesJson: Json;
  eligibilityJson: Json;
  heroes: StartFlowHeroOption[];
}

export interface StartFlowOriginOption extends Origin {
  originId: string;
  originKey: string;
  originLabel: string;
  originDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  bonusesJson: Json;
  bonusSummaryText: string;
}

export interface StartFlowHeroCreationInput {
  serverId: string;
  originId: string;
  heroName: string;
  requestId?: string;
}

export interface StartFlowHeroCreationResult {
  heroId: string;
  serverId: string;
  heroName: string;
  originId: string;
  originKey: string;
  originLabel: string;
  estateId: string;
  districtCode: string;
  addressNumber: number;
  address: string;
  characterPointsBalance: number;
  characterPointLedgerId: string;
  prestigeRankNumber: number;
  prestigeRankName: string;
  resourcesJson: Json;
  heroStatsJson: Json;
  routeNextAction: string;
  createdNewHero: boolean;
  auditLogId: string;
}

export interface StartFlowHeroOption {
  heroId: string;
  heroName: string;
  createdAt: string | null;
}

export interface AccountEntryHeroContext {
  heroId: string;
  serverId: string;
  serverKey: string;
  serverName: string;
  heroName: string;
  heroLevel: number;
  estateId: string | null;
  districtCode: string | null;
  addressNumber: number | null;
  address: string | null;
  addressLabel: string | null;
  createdAt: string | null;
  routeNextAction: string;
}

export interface AccountEntryActiveHeroContext extends AccountEntryHeroContext {
  activeHeroJson: Json;
  heroContextJson: Json;
  serverContextJson: Json;
  accessJson: Json;
}

export const START_FLOW_DASHBOARD_ENTRY_ACTIONS = [
  'dashboard',
  'game_shell',
  'enter_game',
  'hero_dashboard',
] as const;

export type StartFlowDashboardEntryAction =
  typeof START_FLOW_DASHBOARD_ENTRY_ACTIONS[number];

export function isStartFlowDashboardEntryAction(
  action: string,
): action is StartFlowDashboardEntryAction {
  return START_FLOW_DASHBOARD_ENTRY_ACTIONS.includes(
    action as StartFlowDashboardEntryAction,
  );
}

export type StartFlowEntryRouteAction =
  | 'create_hero'
  | 'dashboard'
  | 'hero_selection'
  | 'blocked';

export interface StartFlowEntryDecision {
  action: StartFlowEntryRouteAction;
  route: string | null;
  message: string | null;
}
