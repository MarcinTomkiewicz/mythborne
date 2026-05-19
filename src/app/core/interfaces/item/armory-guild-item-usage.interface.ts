export type ArmoryGuildItemUsageKey =
  | 'owned_private'
  | 'deposited_in_guild_armory'
  | 'borrowed_from_guild_armory'
  | 'borrowed_by_guild_member'
  | 'unknown';

export interface ArmoryGuildItemUsage {
  key: ArmoryGuildItemUsageKey;
  label: string;
  detail: string | null;
  privateActionsAllowed: boolean;
}
