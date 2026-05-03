export interface EstateRelocationResult {
  oldEstateId: string;
  newEstateId: string;
  heroId: string;
  serverId: string;
  districtCode: string;
  addressNumber: number;
  addressLabel: string;
  auditLogId: string;
}

export interface EstateRelocationInput {
  districtCode: string;
  addressNumber: number;
  confirmDestroyExistingEstate: boolean;
  reason?: string;
}
