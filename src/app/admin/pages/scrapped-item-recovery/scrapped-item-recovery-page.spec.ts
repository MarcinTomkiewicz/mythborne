import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  GameServerKind,
  GameServerStatus,
  GlobalRoleKey,
} from '../../../core/enums/active-server.enum';
import {
  SelectedGameServer,
  ServerAccessState,
} from '../../../core/interfaces/server/active-server.interface';
import { RecoverableScrappedItemSearchResult } from '../../../core/domain/item/item-lifecycle.model';
import { ItemLifecycleService } from '../../../core/services/items/item-lifecycle';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ScrappedItemRecoveryPage } from './scrapped-item-recovery-page';

describe('ScrappedItemRecoveryPage', () => {
  let fixture: ComponentFixture<ScrappedItemRecoveryPage>;
  let lifecycle: jasmine.SpyObj<ItemLifecycleService>;

  beforeEach(() => {
    lifecycle = jasmine.createSpyObj<ItemLifecycleService>(
      'ItemLifecycleService',
      ['searchRecoverableScrappedItems', 'recoverScrappedItem'],
    );
    lifecycle.searchRecoverableScrappedItems.and.returnValue(of(searchResult()));

    TestBed.configureTestingModule({
      imports: [ScrappedItemRecoveryPage],
      providers: [
        provideRouter([]),
        { provide: ActiveServer, useValue: activeServerStub() },
        { provide: ItemLifecycleService, useValue: lifecycle },
      ],
    });

    fixture = TestBed.createComponent(ScrappedItemRecoveryPage);
  });

  it('loads recoverable scrapped affix items for the selected server', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(lifecycle.searchRecoverableScrappedItems).toHaveBeenCalledWith({
      serverId: 'server-1',
      query: '',
      limit: 25,
      offset: 0,
    });
    expect(text).toContain('Scrapped item recovery');
    expect(text).toContain('Recovered blade');
    expect(text).toContain('Recoverable until: 2026-06-01T10:00:00.000Z');
    expect(text).toContain('Ordinary no-affix items are hard-deleted');
  });

  it('renders recovery action without implying ordinary no-affix recovery', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Recover to owner');
    expect(text).toContain('prefix affix');
    expect(text).not.toContain('Recover no-affix item');
  });
});

function textContent(
  fixture: ComponentFixture<ScrappedItemRecoveryPage>,
): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function searchResult(): RecoverableScrappedItemSearchResult {
  return {
    totalCount: 1,
    items: [{
      itemId: 'item-1',
      itemDisplayName: 'Recovered blade',
      itemValue: 120,
      generationBaseId: 'base-1',
      generationQualityKey: 'normal',
      prefixAffixId: 'prefix-1',
      suffixAffixId: null,
      ownerHeroId: 'hero-1',
      ownerHeroName: 'Owner hero',
      ownerUserId: 'user-1',
      ownerDisplayName: 'Owner account',
      scrappedAt: '2026-05-01T10:00:00.000Z',
      recoverableUntil: '2026-06-01T10:00:00.000Z',
      matchKind: 'item_name',
      technicalLabel: 'item-1',
    }],
  };
}

function activeServerStub(): Pick<
  ActiveServer,
  'access' | 'isLoading' | 'loadAccessibleServers' | 'selectedServer' | 'servers'
> {
  return {
    access: signal<ServerAccessState>({
      userId: 'user-1',
      isAdmin: true,
      isOperator: false,
      isTester: false,
      isModerator: false,
      isMembershipBlocked: false,
      globalRoleKey: GlobalRoleKey.Admin,
      membershipStatus: null,
      membership: null,
      serverStaffRole: null,
      isServerStaff: false,
      isMembershipActive: true,
      isMembershipSuspended: false,
      isMembershipBanned: false,
      canAccessSandbox: false,
      canManageSelectedServer: true,
    }),
    isLoading: signal(false),
    loadAccessibleServers: jasmine.createSpy('loadAccessibleServers').and.returnValue(of([])),
    selectedServer: signal<SelectedGameServer>({
      id: 'server-1',
      key: 'server-1',
      name: 'Server One',
      kind: GameServerKind.Standard,
      status: GameServerStatus.Live,
      description: null,
      launchedAt: null,
      archivedAt: null,
      membershipStatus: null,
      membership: null,
      staffRole: null,
      canManage: true,
      canUseAsSandbox: false,
    }),
    servers: signal<SelectedGameServer[]>([{
      id: 'server-1',
      key: 'server-1',
      name: 'Server One',
      kind: GameServerKind.Standard,
      status: GameServerStatus.Live,
      description: null,
      launchedAt: null,
      archivedAt: null,
      membershipStatus: null,
      membership: null,
      staffRole: null,
      canManage: true,
      canUseAsSandbox: false,
    }]),
  };
}
