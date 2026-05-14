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

  it('renders row-value routes as plain anchors instead of badges', () => {
    fixture.componentRef.setInput('page', page({
      persistentStateRows: [
        {
          key: 'vicinity-view',
          label: 'Vicinity view',
          value: 'Open Vicinity',
          route: '/game/vicinity',
          isAttention: false,
        },
      ],
    }));

    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const link = host.querySelector<HTMLAnchorElement>('a');
    const rejectedLinkClasses = ['inline' + '-link', 'text' + '-link'];

    expect(link?.textContent?.trim()).toBe('Open Vicinity');
    expect(link?.classList.contains('tag-badge')).toBeFalse();
    expect(rejectedLinkClasses.every((className) =>
      !link?.classList.contains(className)
    )).toBeTrue();
  });
});

function page(overrides: {
  isPersistentStateLoading?: boolean;
  isPersistentStateLoaded?: boolean;
  worldStateErrors?: string[];
  persistentStateRows?: Array<{
    key: string;
    label: string;
    value: string;
    route: string | null;
    isAttention: boolean;
  }>;
} = {}): DashboardPageFacade {
  return {
    isPersistentStateLoading: () => overrides.isPersistentStateLoading ?? false,
    isPersistentStateLoaded: () => overrides.isPersistentStateLoaded ?? true,
    worldStateErrors: () => overrides.worldStateErrors ?? [],
    persistentStateRows: () => overrides.persistentStateRows ?? [],
  } as unknown as DashboardPageFacade;
}
