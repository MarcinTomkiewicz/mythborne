import {
  firstRelocateHeroEstateRow,
  mapRelocateHeroEstateResult,
  toRelocateHeroEstateRpcArgs,
} from './estate-relocation-rpc';
import { RelocateHeroEstateRpcRow } from '../types/estate-relocation-rpc.types';

describe('estate relocation RPC helpers', () => {
  it('maps destructive relocation input to canonical RPC args', () => {
    expect(
      toRelocateHeroEstateRpcArgs('hero-1', {
        districtCode: 'C',
        addressNumber: 42,
        confirmDestroyExistingEstate: true,
        reason: ' move estate ',
      }),
    ).toEqual({
      p_hero_id: 'hero-1',
      p_district_code: 'C',
      p_address_number: 42,
      p_confirm_destroy_existing_estate: true,
      p_reason: 'move estate',
    });
  });

  it('rejects relocation without destructive confirmation', () => {
    expect(() =>
      toRelocateHeroEstateRpcArgs('hero-1', {
        districtCode: 'C',
        addressNumber: 42,
        confirmDestroyExistingEstate: false,
      }),
    ).toThrowError('Estate relocation requires destructive confirmation.');
  });

  it('maps relocation result row to read model label from source-of-truth fields', () => {
    expect(mapRelocateHeroEstateResult(relocationRow())).toEqual({
      oldEstateId: 'estate-old',
      newEstateId: 'estate-new',
      heroId: 'hero-1',
      serverId: 'server-1',
      districtCode: 'D',
      addressNumber: 7,
      addressLabel: 'D-7',
      auditLogId: 'audit-1',
    });
  });

  it('requires a result row from the relocation RPC', () => {
    expect(() => firstRelocateHeroEstateRow([])).toThrowError(
      'Estate relocation RPC returned no result row.',
    );
  });
});

function relocationRow(): RelocateHeroEstateRpcRow {
  return {
    old_estate_id: 'estate-old',
    new_estate_id: 'estate-new',
    hero_id: 'hero-1',
    server_id: 'server-1',
    district_code: 'D',
    address_number: 7,
    address: 'legacy-display',
    audit_log_id: 'audit-1',
  };
}
