import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardPageFacade } from '../../../../core/services/hero/dashboard-page.facade';
import { DashboardPersistentState } from './dashboard-persistent-state';

describe('DashboardPersistentState', () => {
  let fixture: ComponentFixture<DashboardPersistentState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPersistentState],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPersistentState);
  });

  it('links display-ready world state rows through actionKey', () => {
    fixture.componentRef.setInput('page', page({
      persistentStateRows: [
        {
          key: 'vicinity',
          label: 'Okolica',
          value: 'open',
          displayValue: 'Otwórz okolicę',
          tone: 'info',
          sortOrder: 20,
          actionKey: 'open_vicinity',
          source: 'dashboard',
        },
      ],
    }));

    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const link = host.querySelector<HTMLAnchorElement>('a');

    expect(host.textContent).toContain('Otwórz okolicę');
    expect(link?.getAttribute('href')).toBe('/game/vicinity');
  });
});

function page(overrides: {
  isPersistentStateLoading?: boolean;
  isPersistentStateLoaded?: boolean;
  worldStateErrors?: string[];
  persistentStateRows?: Array<{
    key: string;
    label: string;
    value: unknown;
    displayValue: string;
    tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'golden';
    sortOrder: number;
    actionKey?: 'open_vicinity' | 'open_estate' | 'open_exploration' | null;
    source?: string;
  }>;
} = {}): DashboardPageFacade {
  return {
    isPersistentStateLoading: () => overrides.isPersistentStateLoading ?? false,
    isPersistentStateLoaded: () => overrides.isPersistentStateLoaded ?? true,
    worldStateErrors: () => overrides.worldStateErrors ?? [],
    persistentStateRows: () => overrides.persistentStateRows ?? [],
  } as unknown as DashboardPageFacade;
}
