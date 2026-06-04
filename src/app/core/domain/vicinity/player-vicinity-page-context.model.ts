import type { Json } from '../../types/database.types';

export interface PlayerVicinityPageContextReadModel {
  contractVersion: 'player_vicinity_page_context_v2';
  hero: PlayerVicinityHeroReadModel;
  copyJson: PlayerVicinityCopyReadModel;
  currentEstate: PlayerVicinityCurrentEstateReadModel;
  estateSummary: PlayerVicinityEstateSummaryReadModel;
  estateRuntimeState: PlayerVicinityEstateSummaryReadModel;
  addressCapacities: PlayerVicinityAddressCapacityReadModel[];
  occupiedEstates: PlayerVicinityOccupiedEstateReadModel[];
}

export interface PlayerVicinityHeroReadModel {
  id: string;
  name: string;
  level: number | null;
  originId: string | null;
  rank: number | null;
  experience: number | null;
  profilePicture: string | null;
  createdAt: string | null;
  estateId: string | null;
  userId: string;
  serverId: string;
  characterPoints: number;
  totalCharacterPointsEarned: number;
  totalExperienceEarned: number;
}

export interface PlayerVicinityCopyReadModel {
  page: {
    errorLabel: string;
    pvpLabel: string;
    summaryAriaLabel: string;
  };
  sections: {
    vicinity: string;
    currentEstate: string;
    addresses: string;
    districts: string;
  };
  toolbar: {
    currentVicinityButtonLabel: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchButtonLabel: string;
  };
  summary: {
    backendDataUnavailableLabel: string;
    dailyAttacksLabel: string;
    currentAddressLabel: string;
    attackProtectionLabel: string;
    siegeProtectionLabel: string;
    noActiveProtectionLabel: string;
  };
  relocation: {
    confirmTitle: string;
    confirmMessage: string;
    confirmLabel: string;
    cancelLabel: string;
    confirmMessageParts: {
      intro: string;
      warningLabel: string;
      warningText: string;
    };
  };
  selectedTarget: {
    targetLabel: string;
    attackTravelLabel: string;
    spyTravelLabel: string;
    siegeLabel: string;
    protectionLabel: string;
  };
  addressList: {
    columnHero: string;
    columnLevel: string;
    columnAttack: string;
    columnSpy: string;
    columnActions: string;
    claimEstateLabel: string;
    noGuildLabel: string;
    sameGuildLabel: string;
    protectedTargetAriaLabel: string;
    metricUnavailableLabel: string;
    protectionUntilTemplate: string;
    attackTooltip: string;
    spyTooltip: string;
    siegeTooltip: string;
    claimEstateTooltip: string;
  };
  pagination: {
    pageLabelTemplate: string;
    pageSelectPlaceholder: string;
    rangeSummaryTemplate: string;
    pageUnavailableLabel: string;
    rangeUnavailableLabel: string;
  };
  errors: {
    inactiveDistrictTemplate: string;
  };
  filters: {
    district: string;
    allDistricts: string;
  };
  labels: {
    address: string;
    district: string;
    occupied: string;
    empty: string;
    currentEstate: string;
    estateRank: string;
  };
  empty: {
    occupiedEstates: string;
    districtAddresses: string;
  };
  helper: {
    emptyAddressGeneration: string;
  };
}

export interface PlayerVicinityCurrentEstateReadModel {
  estateId: string;
  serverId: string;
  heroId: string;
  districtCode: string | null;
  districtLabel: string | null;
  addressNumber: number | null;
  address: string | null;
  estateRank: number | null;
  occupancyStatusKey: 'current';
  occupancyLabel: string;
}

export interface PlayerVicinityEstateSummaryReadModel {
  heroId: string;
  serverId: string;
  estateId: string;
  districtCode: string | null;
  districtLabel: string | null;
  addressNumber: number | null;
  address: string | null;
  estateRank: number | null;
  settledCompletedCount: number | null;
  settledAsOf: string | null;
  activeJobJson: PlayerVicinityActiveJobReadModel | null;
  attackProtectionActive: boolean | null;
  attackProtectionExpiresAt: string | null;
  attackProtectionSourceEntityType: string | null;
  attackProtectionSourceEntityId: string | null;
  siegeProtectionActive: boolean | null;
  siegeProtectionExpiresAt: string | null;
  siegeProtectionSource: string | null;
}

export interface PlayerVicinityActiveJobReadModel {
  jobId: string;
  estateId: string;
  buildingId: string;
  buildingKey: string;
  buildingName: string;
  targetLevel: number;
  status: string;
  startedAt: string;
  completesAt: string;
  createdAt: string;
  updatedAt: string;
  secondsUntilCompletion: number;
  isDue: boolean;
}

export interface PlayerVicinityAddressCapacityReadModel {
  districtCode: string;
  displayLabel: string;
  addressCapacity: number;
  addressNumberStart: number;
  addressNumberEnd: number;
  firstAddress: string;
  lastAddress: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PlayerVicinityOccupiedEstateReadModel {
  estateId: string;
  serverId: string;
  heroId: string;
  districtCode: string | null;
  districtLabel: string | null;
  addressNumber: number | null;
  address: string | null;
  displayLabel: string | null;
  estateRank: number;
  isCurrentHeroEstate: boolean;
  occupancyStatusKey: 'current' | 'occupied' | string;
  occupancyLabel: string;
}

export interface PlayerVicinityAddressRowReadModel {
  districtCode: string;
  districtLabel: string;
  addressNumber: number;
  address: string;
  displayLabel: string;
  isOccupied: boolean;
  isCurrentHeroEstate: boolean;
  occupancyStatusKey: 'empty' | 'current' | 'occupied' | string;
  occupancyLabel: string;
  estateId?: string;
  serverId?: string;
  heroId?: string;
  estateRank?: number;
}

export type PlayerVicinityRawJson = Json;
