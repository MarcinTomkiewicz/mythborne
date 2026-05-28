export type VicinityRowActionKind = 'spy' | 'attack' | 'siege';
export type VicinityRowActionAvailability = 'spy' | 'attack' | 'never';
export type PvpStartActionKind = 'attack' | 'spy';

export interface VicinityRowActionConfig {
  kind: VicinityRowActionKind;
  icon: string;
  label: string;
  severity: 'danger' | 'secondary';
  availability: VicinityRowActionAvailability;
  primaryWhenAvailable: boolean;
}

export interface VicinityRowAction {
  kind: VicinityRowActionKind;
  icon: string;
  label: string;
  severity: 'danger' | 'secondary';
  disabled: boolean;
  primary: boolean;
}

export interface PendingPvpAction {
  actionKind: PvpStartActionKind;
  targetHeroId: string;
}

export interface PvpVisibleAddressTargetOverlayInput {
  districtCode: string;
  fromAddressNumber: number;
  toAddressNumber: number;
}
