import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { StartFlowOriginOption } from '../../../core/domain/start-flow/start-flow.model';
import { StartFlow } from '../../../core/services/start-flow/start-flow';
import { CreateCharacterForm } from '../../../core/types/forms/create-character-form.types';
import { CreateCharacterPage } from './create-character-page';
import { CreateCharacterPageFacade } from '../../../core/services/hero/create-character-page.facade';

describe('CreateCharacterPage', () => {
  it('shows one account-side hero creation screen for an existing account flow', () => {
    const fixture = createFixture(true);

    fixture.detectChanges();

    const text = textContent(fixture);
    expect(text).toContain('Nazwij bohatera i wybierz pochodzenie.');
    expect(text).toContain('Wybrany serwer');
    expect(text).toContain('Nazwa bohatera');
    expect(text).toContain('Pochodzenie');
    expect(text).toContain('Podsumowanie tworzenia');
    expect(text).not.toContain('Konto');
    expect(text).not.toContain('Profil');
    expect(text).not.toContain('Opowiedz o sobie');
  });

  it('renders DB-backed origin selection and creation summary without stepping', () => {
    const fixture = createFixture(true);

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).toContain('Spartanin');
    expect(text).toContain('No bonuses.');
    expect(text).toContain('Przydzielane po utworzeniu');
    expect(text).toContain('Adres zostanie przydzielony automatycznie');
  });

  it('keeps account and profile steps for the unauthenticated new account flow', () => {
    const fixture = createFixture(false);

    fixture.detectChanges();

    const text = textContent(fixture);
    expect(text).toContain('Konto');
    expect(text).toContain('Bohater');
    expect(text).toContain('Pochodzenie');
    expect(text).toContain('Profil');
  });
});

function createFixture(
  hasExistingAccount: boolean,
): ComponentFixture<CreateCharacterPage> {
  TestBed.resetTestingModule();
  const facade = facadeStub(hasExistingAccount);

  TestBed.configureTestingModule({
    imports: [CreateCharacterPage],
    providers: [
      {
        provide: StartFlow,
        useValue: jasmine.createSpyObj<StartFlow>('StartFlow', {
          getOriginOptions: of([originOption()]),
        }),
      },
    ],
  });
  TestBed.overrideComponent(CreateCharacterPage, {
    remove: { providers: [CreateCharacterPageFacade] },
    add: { providers: [{ provide: CreateCharacterPageFacade, useValue: facade }] },
  });

  return TestBed.createComponent(CreateCharacterPage);
}

function facadeStub(hasExistingAccount: boolean): Partial<CreateCharacterPageFacade> {
  const form = createForm();
  const step = signal(1);

  return {
    accountForm: form.controls.account,
    canOpenStep: () => true,
    errorMessage: signal<string | null>(null).asReadonly(),
    form,
    hasExistingAccount: signal(hasExistingAccount).asReadonly(),
    heroForm: form.controls.hero,
    isSubmitting: signal(false).asReadonly(),
    nextFromAccount: jasmine.createSpy('nextFromAccount'),
    nextFromHero: jasmine.createSpy('nextFromHero').and.callFake(() => step.set(hasExistingAccount ? 2 : 3)),
    onOriginNext: jasmine.createSpy('onOriginNext'),
    prevStep: jasmine.createSpy('prevStep'),
    profileForm: form.controls.profile,
    selectedOrigin: signal(null).asReadonly(),
    selectedServer: signal({
      id: 'server-1',
      key: 'sandbox',
      name: 'Sandbox',
      kind: 'sandbox',
      status: 'live',
      description: null,
      launchedAt: null,
      archivedAt: null,
      membershipStatus: 'active',
      membership: null,
      staffRole: null,
      canManage: false,
      canUseAsSandbox: true,
    }).asReadonly(),
    selectedServerAvailability: signal({
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
      nextAction: 'create_hero',
      blockReason: null,
      userHeroCount: 0,
      defaultHeroId: null,
      defaultHeroName: null,
      isServerFull: false,
      isDistrictAFull: false,
      districtACapacity: 100,
      districtAOccupied: 2,
      districtAFree: 98,
      heroesJson: [],
      eligibilityJson: {},
      heroes: [],
    }).asReadonly(),
    serverAvailabilityError: signal<string | null>(null).asReadonly(),
    step: step.asReadonly(),
    onStepChange: jasmine.createSpy('onStepChange'),
    submit: jasmine.createSpy('submit'),
    user: signal(hasExistingAccount ? { id: 'user-1', email: 'hero@example.com' } : null).asReadonly(),
  } as unknown as Partial<CreateCharacterPageFacade>;
}

function originOption(): StartFlowOriginOption {
  return {
    id: 'origin-1',
    key: 'spartan',
    name: 'Spartanin',
    description: 'Spartan origin.',
    imageUrl: '/images/origins/spartan.png',
    createdAt: '2026-05-01T10:00:00Z',
    originId: 'origin-1',
    originKey: 'spartan',
    originLabel: 'Spartanin',
    originDescription: 'Spartan origin.',
    sortOrder: 1,
    isActive: true,
    bonusesJson: [],
    bonusSummaryText: 'No bonuses.',
  };
}

function createForm(): CreateCharacterForm {
  return new FormGroup({
    account: new FormGroup({
      email: new FormControl('', { nonNullable: true }),
      password: new FormControl('', { nonNullable: true }),
    }),
    hero: new FormGroup({
      characterName: new FormControl('', { nonNullable: true }),
    }),
    originId: new FormControl('', { nonNullable: true }),
    profile: new FormGroup({
      name: new FormControl('', { nonNullable: true }),
      birthday: new FormControl<Date | null>(null),
      city: new FormControl('', { nonNullable: true }),
      facebook: new FormControl('', { nonNullable: true }),
      twitter: new FormControl('', { nonNullable: true }),
      linkedin: new FormControl('', { nonNullable: true }),
      instagram: new FormControl('', { nonNullable: true }),
      bio: new FormControl('', { nonNullable: true }),
    }),
  });
}

function textContent(fixture: ComponentFixture<CreateCharacterPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}
