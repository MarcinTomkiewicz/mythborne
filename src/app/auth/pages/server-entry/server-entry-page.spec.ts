import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StartFlowHeroOption, StartFlowServerAvailability } from '../../../core/domain/start-flow/start-flow.model';
import { SelectedGameServer } from '../../../core/interfaces/server/active-server.interface';
import { Auth } from '../../../core/services/auth/auth';
import { StartFlowEntryState } from '../../../core/services/start-flow/start-flow-entry.state';
import { ServerEntryPage } from './server-entry-page';

describe('ServerEntryPage', () => {
  it('renders compact sandbox hero switcher with default/current context and sandbox creation action', () => {
    const state = stateStub({
      selectedHeroOptions: [
        heroOption({ heroId: 'hero-1', heroName: 'First' }),
        heroOption({ heroId: 'hero-2', heroName: 'Second' }),
      ],
      defaultHero: heroOption({ heroId: 'hero-1', heroName: 'First' }),
      activeHero: heroOption({ heroId: 'hero-2', heroName: 'Second' }),
      canCreateSandboxHero: true,
      showHeroSelection: true,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).toContain('Postacie na tym sandboxie');
    expect(text).toContain('Domyślna postać:');
    expect(text).toContain('First');
    expect(text).toContain('Aktywna postać:');
    expect(text).toContain('Second');
    expect(text).toContain('Nowa postać');
    expect(fixture.debugElement.queryAll(By.css('p-select')).length).toBe(1);
  });

  it('renders logout action on server entry', () => {
    const fixture = createFixture(stateStub());

    fixture.detectChanges();

    expect(textContent(fixture)).toContain('Wyloguj');
  });

  it('selects another DB-returned sandbox hero from the compact switcher', () => {
    const state = stateStub({
      selectedHeroOptions: [
        heroOption({ heroId: 'hero-1', heroName: 'First' }),
        heroOption({ heroId: 'hero-2', heroName: 'Second' }),
      ],
      defaultHero: heroOption({ heroId: 'hero-1', heroName: 'First' }),
      activeHero: heroOption({ heroId: 'hero-1', heroName: 'First' }),
      canCreateSandboxHero: true,
      showHeroSelection: true,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();
    fixture.componentInstance.selectedSandboxHeroControl.setValue('hero-2');
    fixture.detectChanges();
    const useHeroButton = fixture.debugElement
      .queryAll(By.css('p-button'))
      .find((entry) => entry.componentInstance.label === 'Przełącz');

    useHeroButton?.triggerEventHandler('onClick', {});

    expect(state.selectHero).toHaveBeenCalledOnceWith('hero-2');
  });

  it('does not render one switch button per sandbox hero', () => {
    const state = stateStub({
      selectedHeroOptions: Array.from({ length: 25 }, (_, index) =>
        heroOption({
          heroId: `hero-${index + 1}`,
          heroName: `Hero ${index + 1}`,
          createdAt: `2026-05-${String(index + 1).padStart(2, '0')}T10:00:00Z`,
        }),
      ),
      defaultHero: heroOption({ heroId: 'hero-1', heroName: 'Hero 1' }),
      activeHero: heroOption({ heroId: 'hero-1', heroName: 'Hero 1' }),
      canCreateSandboxHero: true,
      showHeroSelection: true,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const switchButtons = fixture.debugElement
      .queryAll(By.css('p-button'))
      .filter((entry) => entry.componentInstance.label === 'Przełącz');

    expect(fixture.debugElement.queryAll(By.css('p-select')).length).toBe(1);
    expect(switchButtons.length).toBe(1);
  });

  it('renders sandbox creation action next to continue for selected sandbox dashboard entry', () => {
    const state = stateStub({
      selectedHeroOptions: [
        heroOption({ heroId: 'hero-1', heroName: 'First' }),
      ],
      activeHero: heroOption({ heroId: 'hero-1', heroName: 'First' }),
      canCreateSandboxHero: true,
      showHeroSelection: false,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).toContain('Continue');
    expect(text).toContain('Nowa postać');
  });

  it('does not render sandbox hero switcher for standard server state', () => {
    const state = stateStub({
      availability: availability({ isSandbox: false, isStandard: true }),
      canCreateSandboxHero: false,
      showHeroSelection: false,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).not.toContain('Postacie na tym sandboxie');
    expect(text).not.toContain('Nowa postać');
  });

  it('does not render sandbox creation link when DB blocks sandbox creation', () => {
    const state = stateStub({
      availability: availability({
        canCreateHero: false,
        blockReason: 'Sandbox creation is blocked.',
      }),
      selectedHeroOptions: [
        heroOption({ heroId: 'hero-1', heroName: 'First' }),
        heroOption({ heroId: 'hero-2', heroName: 'Second' }),
      ],
      canCreateSandboxHero: false,
      showHeroSelection: true,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).toContain('Postacie na tym sandboxie');
    expect(text).not.toContain('Nowa postać');
  });
});

function createFixture(
  state: Partial<StartFlowEntryState>,
): ComponentFixture<ServerEntryPage> {
  TestBed.configureTestingModule({
    imports: [ServerEntryPage],
    providers: [
      provideRouter([]),
      {
        provide: Auth,
        useValue: jasmine.createSpyObj<Auth>('Auth', {
          logout: of(void 0),
        }),
      },
    ],
  });
  TestBed.overrideComponent(ServerEntryPage, {
    remove: { providers: [StartFlowEntryState] },
    add: { providers: [{ provide: StartFlowEntryState, useValue: state }] },
  });

  return TestBed.createComponent(ServerEntryPage);
}

function stateStub(input: {
  availability?: StartFlowServerAvailability;
  selectedHeroOptions?: StartFlowHeroOption[];
  defaultHero?: StartFlowHeroOption | null;
  activeHero?: StartFlowHeroOption | null;
  canCreateSandboxHero?: boolean;
  showHeroSelection?: boolean;
} = {}): Partial<StartFlowEntryState> {
  const selectedServer = server();
  const currentAvailability = input.availability ?? availability();

  const stub = {
    activeHeroOption: signal(input.activeHero ?? null).asReadonly(),
    blocker: signal<string | null>(null).asReadonly(),
    canCreateSandboxHero: signal(input.canCreateSandboxHero ?? false).asReadonly(),
    enterSelectedServer: jasmine.createSpy('enterSelectedServer'),
    error: signal<string | null>(null).asReadonly(),
    isLoading: signal(false).asReadonly(),
    isTransitioning: signal(false).asReadonly(),
    load: jasmine.createSpy('load'),
    selectedDefaultHeroOption: signal(input.defaultHero ?? null).asReadonly(),
    selectedHeroOptions: signal(input.selectedHeroOptions ?? []).asReadonly(),
    selectedServer: signal<SelectedGameServer | null>(selectedServer).asReadonly(),
    selectHero: jasmine.createSpy('selectHero'),
    selectServer: jasmine.createSpy('selectServer'),
    serverAvailability: (candidate: SelectedGameServer) =>
      candidate.id === currentAvailability.serverId ? currentAvailability : null,
    servers: signal<SelectedGameServer[]>([selectedServer]).asReadonly(),
    showHeroSelection: signal(input.showHeroSelection ?? false).asReadonly(),
    visibleAvailability: signal<StartFlowServerAvailability[]>([currentAvailability]).asReadonly(),
  };

  return stub as unknown as Partial<StartFlowEntryState>;
}

function server(): SelectedGameServer {
  return {
    id: 'server-1',
    key: 'sandbox',
    name: 'Sandbox',
    kind: 'sandbox',
    status: 'live',
    description: 'Sandbox server.',
    launchedAt: null,
    archivedAt: null,
    membershipStatus: 'active',
    membership: null,
    staffRole: null,
    canManage: false,
    canUseAsSandbox: true,
  };
}

function availability(
  patch: Partial<StartFlowServerAvailability> = {},
): StartFlowServerAvailability {
  return {
    serverId: 'server-1',
    serverKey: 'sandbox',
    serverName: 'Sandbox',
    serverKind: 'sandbox',
    serverStatus: 'live',
    description: 'Sandbox server.',
    membershipStatus: 'active',
    isVisible: true,
    isStandard: false,
    isSandbox: true,
    isStaffContext: true,
    canEnterGame: true,
    canCreateHero: true,
    nextAction: 'hero_selection',
    blockReason: null,
    userHeroCount: 2,
    defaultHeroId: 'hero-1',
    defaultHeroName: 'First',
    isServerFull: false,
    isDistrictAFull: false,
    districtACapacity: 100,
    districtAOccupied: 2,
    districtAFree: 98,
    heroesJson: [],
    eligibilityJson: {},
    heroes: [],
    ...patch,
  };
}

function heroOption(
  patch: Partial<StartFlowHeroOption> = {},
): StartFlowHeroOption {
  return {
    heroId: 'hero-1',
    heroName: 'First',
    createdAt: '2026-05-01T10:00:00Z',
    ...patch,
  };
}

function textContent(fixture: ComponentFixture<ServerEntryPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}
