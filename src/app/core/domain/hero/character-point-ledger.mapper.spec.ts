import { Row } from '../../types/supabase.types';
import { mapCharacterPointLedgerEntry } from './character-point-ledger.mapper';

describe('mapCharacterPointLedgerEntry', () => {
  it('maps XP-derived Character Points as gross gain history', () => {
    const result = mapCharacterPointLedgerEntry(ledgerRow());

    expect(result).toEqual({
      id: 'cp-ledger-1',
      heroId: 'hero-1',
      serverId: 'server-1',
      reason: 'experience_gain',
      entryType: 'xp_gain',
      reasonLabel: 'XP-derived Character Points',
      amountDelta: 120,
      amountLabel: '+120 Character Points',
      balanceAfter: 180,
      createdAt: '2026-05-03T10:00:00.000Z',
    });
  });

  it('maps penalty sink/payment as a separate negative event', () => {
    const result = mapCharacterPointLedgerEntry(
      ledgerRow({
        id: 'cp-ledger-2',
        reason: 'penalty_payment',
        amount_delta: -50,
        balance_after: 130,
      }),
    );

    expect(result.entryType).toBe('penalty_payment');
    expect(result.reasonLabel).toBe('Penalty sink payment');
    expect(result.amountLabel).toBe('-50 Character Points');
    expect(result.balanceAfter).toBe(130);
  });
});

function ledgerRow(
  overrides: Partial<Row<'character_point_ledger'>> = {},
): Row<'character_point_ledger'> {
  return {
    id: 'cp-ledger-1',
    hero_id: 'hero-1',
    server_id: 'server-1',
    reason: 'experience_gain',
    amount_delta: 120,
    balance_after: 180,
    related_entity_type: 'hero_progression_ledger',
    related_entity_id: 'progression-ledger-1',
    description: 'Internal description not exposed to player history.',
    created_by: 'system',
    created_at: '2026-05-03T10:00:00.000Z',
    ...overrides,
  };
}
