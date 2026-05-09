import {
  GetHeroGuildArmoryItemRowsRpcRow,
  GetHeroGuildArmoryLoanRowsRpcRow,
} from '../types/guild-rpc.types';
import {
  mapGuildArmoryItem,
  mapGuildArmoryLoan,
  mapGuildArmoryReadModel,
} from './guild-armory-read-mappers';

describe('guild armory read mappers', () => {
  it('maps current armory item rows with owner and borrower context', () => {
    expect(mapGuildArmoryItem(itemRow())).toEqual({
      guildId: 'guild-1',
      armoryItemId: 'armory-item-1',
      itemId: 'item-1',
      itemName: 'Bronze Spear',
      itemStatus: 'active',
      baseTypeKey: 'spear',
      generationQualityKey: 'common',
      qualityLabel: 'Common',
      armoryStatusKey: 'borrowed',
      ownerHeroId: 'owner-hero-1',
      ownerHeroName: 'Owner Hero',
      depositedAt: '2026-05-09T10:00:00.000Z',
      loanId: 'loan-1',
      loanStatusKey: 'active',
      borrowerHeroId: 'borrower-hero-1',
      borrowerHeroName: 'Borrower Hero',
      borrowedAt: '2026-05-09T11:00:00.000Z',
      canBorrow: false,
      canReturn: true,
      canForceReturn: true,
      canWithdraw: false,
      canRemove: false,
    });
  });

  it('rejects terminal armory item status in current player-facing rows', () => {
    expect(() => mapGuildArmoryItem(itemRow({ armory_status_key: 'removed' })))
      .toThrowError('Unexpected current guild armory item status: removed.');
  });

  it('maps loan rows preserving nullable reason fields', () => {
    expect(mapGuildArmoryLoan(loanRow({
      due_at: '',
      ended_at: '',
      reason: ' Borrowed for trial. ',
      status_reason: '',
    }))).toEqual(jasmine.objectContaining({
      loanId: 'loan-1',
      loanStatusKey: 'active',
      reason: 'Borrowed for trial.',
      statusReason: null,
      dueAt: null,
      endedAt: null,
    }));
  });

  it('maps read model from item and loan rows', () => {
    const result = mapGuildArmoryReadModel([itemRow()], [loanRow()]);

    expect(result.items[0].armoryItemId).toBe('armory-item-1');
    expect(result.loans[0].loanId).toBe('loan-1');
  });
});

function itemRow(
  overrides: Partial<GetHeroGuildArmoryItemRowsRpcRow> = {},
): GetHeroGuildArmoryItemRowsRpcRow {
  return {
    armory_item_id: 'armory-item-1',
    armory_status_key: 'borrowed',
    base_type_key: 'spear',
    borrowed_at: '2026-05-09T11:00:00.000Z',
    borrower_hero_id: 'borrower-hero-1',
    borrower_hero_name: 'Borrower Hero',
    can_borrow: false,
    can_force_return: true,
    can_remove: false,
    can_return: true,
    can_withdraw: false,
    deposited_at: '2026-05-09T10:00:00.000Z',
    generation_quality_key: 'common',
    guild_id: 'guild-1',
    item_id: 'item-1',
    item_name: 'Bronze Spear',
    item_status: 'active',
    loan_id: 'loan-1',
    loan_status_key: 'active',
    owner_hero_id: 'owner-hero-1',
    owner_hero_name: 'Owner Hero',
    quality_label: 'Common',
    ...overrides,
  };
}

function loanRow(
  overrides: Partial<GetHeroGuildArmoryLoanRowsRpcRow> = {},
): GetHeroGuildArmoryLoanRowsRpcRow {
  return {
    armory_item_id: 'armory-item-1',
    borrowed_at: '2026-05-09T11:00:00.000Z',
    borrower_hero_id: 'borrower-hero-1',
    borrower_hero_name: 'Borrower Hero',
    can_force_return: true,
    can_return: true,
    due_at: '',
    ended_at: '',
    guild_id: 'guild-1',
    item_id: 'item-1',
    item_name: 'Bronze Spear',
    loan_id: 'loan-1',
    loan_status_key: 'active',
    owner_hero_id: 'owner-hero-1',
    owner_hero_name: 'Owner Hero',
    reason: '',
    status_reason: '',
    ...overrides,
  };
}
