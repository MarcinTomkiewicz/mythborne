import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AntiAbuseSignalReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseSignalTypeEntry } from '../../../core/domain/anti-abuse/anti-abuse-dictionary.model';
import { AntiAbuseCaseSignalsSection } from './anti-abuse-case-signals-section';

describe('AntiAbuseCaseSignalsSection', () => {
  let fixture: ComponentFixture<AntiAbuseCaseSignalsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntiAbuseCaseSignalsSection],
    }).compileComponents();

    fixture = TestBed.createComponent(AntiAbuseCaseSignalsSection);
  });

  it('renders DB-backed signal labels and trade/auction evidence references', () => {
    fixture.componentRef.setInput('signalTypes', [signalType()]);
    fixture.componentRef.setInput('signals', [
      signal({
        entityTypeKey: 'player_trade_transaction',
        entityId: 'transaction-1',
        metadataJson: {
          offer_id: 'offer-1',
          auction_listing_id: 'listing-1',
          item_id: 'item-1',
        },
      }),
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Repeated transfer label');
    expect(text).toContain('DB-generated trade/auction review signal');
    expect(text).toContain('Trade transaction: transaction-1');
    expect(text).toContain('Trade offer: offer-1');
    expect(text).toContain('Auction listing: listing-1');
    expect(text).toContain('Item: item-1');
    expect(text).toContain('Type key: trade.repeated_pair_transfers');
  });

  it('handles trade/auction signals with missing related entity data gracefully', () => {
    fixture.componentRef.setInput('signalTypes', [signalType()]);
    fixture.componentRef.setInput('signals', [
      signal({
        signalTypeKey: 'auction.high_cp_sale',
        entityTypeKey: null,
        entityId: null,
        metadataJson: {},
      }),
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('DB-generated trade/auction review signal');
    expect(text).toContain('Related trade or auction entity is not available');
  });

  it('does not classify generic item metadata as trade or auction evidence by itself', () => {
    fixture.componentRef.setInput('signalTypes', [signalType()]);
    fixture.componentRef.setInput('signals', [
      signal({
        signalTypeKey: 'same_device_multiple_accounts',
        entityTypeKey: 'hero',
        entityId: 'hero-1',
        metadataJson: { item_id: 'item-1', transaction_item_id: 'transaction-item-1' },
      }),
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).not.toContain('DB-generated trade/auction review signal');
    expect(text).not.toContain('Item: item-1');
    expect(text).not.toContain('Transaction item: transaction-item-1');
  });
});

function signal(
  overrides: Partial<AntiAbuseSignalReadModel> = {},
): AntiAbuseSignalReadModel {
  return {
    id: 'signal-1',
    serverId: 'server-1',
    signalTypeKey: 'trade.repeated_pair_transfers',
    title: 'Repeated transfer',
    description: 'Repeated trade transfer.',
    severity: 'warning',
    score: 80,
    confidence: 0.75,
    reason: 'DB matched repeated transfer evidence.',
    groupingKey: 'hero-pair:1',
    actorHeroId: 'hero-1',
    actorUserId: 'user-1',
    targetHeroId: 'hero-2',
    targetUserId: 'user-2',
    entityTypeKey: 'player_trade_transaction',
    entityId: 'transaction-1',
    auditLogId: 'audit-1',
    metadataJson: {},
    isDismissed: false,
    dismissedAt: null,
    dismissedByUserId: null,
    dismissedReason: null,
    createdAt: '2026-05-01T10:00:00.000Z',
    ...overrides,
  };
}

function signalType(): AntiAbuseSignalTypeEntry {
  return {
    key: 'trade.repeated_pair_transfers',
    label: 'Repeated transfer label',
    description: 'Repeated transfer type.',
    helperText: 'Review linked transactions.',
    adminDescription: 'DB-generated repeated transfer signal.',
    category: 'trade',
    sortOrder: 10,
    isActive: true,
    defaultSeverity: 'warning',
    defaultScore: 70,
    defaultConfidence: 0.75,
  };
}
