import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { StartFlowHeroOption, StartFlowServerAvailability } from '../../../core/domain/start-flow/start-flow.model';
import { SelectedGameServer } from '../../../core/interfaces/server/active-server.interface';
import { StartFlowEntryState } from '../../../core/services/start-flow/start-flow-entry.state';
import { ServerEntryPage } from './server-entry-page';

describe('ServerEntryPage', () => {
  it('renders sandbox hero switcher with default/current context and sandbox creation link', () => {
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

    expect(text).toContain('Choose sandbox hero');
    expect(text).toContain('Default hero:');
    expect(text).toContain('First');
    expect(text).toContain('Default');
    expect(text).toContain('Second');
    expect(text).toContain('Current');
    expect(text).toContain('Create another sandbox hero');
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

    expect(text).not.toContain('Choose sandbox hero');
    expect(text).not.toContain('Create another sandbox hero');
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

    expect(text).toContain('Choose sandbox hero');
    expect(text).not.toContain('Create another sandbox hero');
  });
});

function createFixture(
  state: Partial<StartFlowEntryState>,
): ComponentFixture<ServerEntryPage> {
  TestBed.configureTestingModule({
    imports: [ServerEntryPage],
    providers: [provideRouter([])],
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
