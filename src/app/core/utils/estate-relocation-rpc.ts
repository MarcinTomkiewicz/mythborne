import {
  EstateRelocationInput,
  EstateRelocationResult,
} from '../domain/estate/estate-relocation.model';
import {
  RelocateHeroEstateRpcArgs,
  RelocateHeroEstateRpcRow,
} from '../types/estate-relocation-rpc.types';
import { formatEstateAddressLabel } from './estate-address';
import { trimToNull } from './normalize-text';

export function toRelocateHeroEstateRpcArgs(
  heroId: string,
  input: EstateRelocationInput,
): RelocateHeroEstateRpcArgs {
  if (!input.confirmDestroyExistingEstate) {
    throw new Error('Estate relocation requires destructive confirmation.');
  }

  const reason = trimToNull(input.reason);
  const args: RelocateHeroEstateRpcArgs = {
    p_hero_id: requiredText(heroId, 'heroId'),
    p_district_code: requiredText(input.districtCode, 'districtCode'),
    p_address_number: positiveInteger(input.addressNumber, 'addressNumber'),
    p_confirm_destroy_existing_estate: true,
  };

  if (reason) {
    args.p_reason = reason;
  }

  return args;
}

export function firstRelocateHeroEstateRow(
  rows: RelocateHeroEstateRpcRow[],
): RelocateHeroEstateRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('Estate relocation RPC returned no result row.');
  }

  return row;
}

export function mapRelocateHeroEstateResult(
  row: RelocateHeroEstateRpcRow,
): EstateRelocationResult {
  return {
    oldEstateId: row.old_estate_id,
    newEstateId: row.new_estate_id,
    heroId: row.hero_id,
    serverId: row.server_id,
    districtCode: row.district_code,
    addressNumber: row.address_number,
    addressLabel: formatEstateAddressLabel(row.district_code, row.address_number),
    auditLogId: row.audit_log_id,
  };
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = value?.trim() ?? '';

  if (!normalized) {
    throw new Error(`Estate relocation ${field} is required.`);
  }

  return normalized;
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Estate relocation ${field} must be a positive integer.`);
  }

  return value;
}
