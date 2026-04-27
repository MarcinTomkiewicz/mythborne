import { BonusScope } from '../types/bonus.types';

export const BONUS_SCOPES = {
  Global: 'global',
  Combat: 'combat',
  PvpAttack: 'pvp_attack',
  PvpDefense: 'pvp_defense',
  Trial: 'trial',
  Exploration: 'exploration',
  Requirements: 'requirements',
  Trade: 'trade',
  Auction: 'auction',
  Economy: 'economy',
  BuildingManagement: 'building_management',
} as const satisfies Record<string, BonusScope>;
