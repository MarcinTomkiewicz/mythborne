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
