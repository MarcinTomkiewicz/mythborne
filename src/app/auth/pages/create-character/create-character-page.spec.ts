import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import {
  StartFlowOriginOption,
  StartFlowServerAvailability,
} from '../../../core/domain/start-flow/start-flow.model';
import { CreateCharacterPageFacade } from '../../../core/services/hero/create-character-page.facade';
import { StartFlow } from '../../../core/services/start-flow/start-flow';
import { CreateCharacterForm } from '../../../core/types/forms/create-character-form.types';
import { CreateCharacterPage } from './create-character-page';
import {
  CreateCharacterServerDetails,
  CreateCharacterServerOption,
} from '../../../core/interfaces/hero/create-character-server-options.interface';

describe('CreateCharacterPage', () => {
  it('renders only the server eligibility selector before hero creation is opened', () => {
    const fixture = createFixture(true);

    fixture.detectChanges();

    const text = textContent(fixture);
    expect(text).toContain('Wybierz świat');
    expect(text).toContain('Przejdź do tworzenia');
    expect(text).not.toContain('Nazwij bohatera i wybierz pochodzenie.');
    expect(text).not.toContain('Nazwa bohatera');
    expect(fixture.debugElement.query(By.css('app-step-origin'))).toBeNull();
  });

  it('renders primary District A capacity for a standard server', () => {
    const fixture = createFixture(true, {
      details: details({
        badges: [{ label: 'Standardowy', tone: 'muted' }],
        summaryRows: [
          {
            label: 'Dzielnica A',
            value: '4615 / 5000 wolnych posiadłości startowych',
            primary: true,
          },
          { label: 'Tworzenie', value: 'Tworzenie dostępne', primary: true },
        ],
      }),
    });

    fixture.detectChanges();

    const text = textContent(fixture);
    expect(text).toContain('Dzielnica A');
    expect(text).toContain('4615 / 5000 wolnych posiadłości startowych');
    expect(text).toContain('Tworzenie dostępne');
  });

  it('disables the CTA for full District A', () => {
    const fixture = createFixture(true, {
      details: details({
        canContinue: false,
        disabledReason: 'Brak wolnych posiadłości startowych w Dzielnicy A.',
        badges: [{ label: 'Brak wolnych miejsc', tone: 'danger' }],
        summaryRows: [
          {
            label: 'Dzielnica A',
            value: '0 / 5000 wolnych posiadłości startowych',
            tone: 'danger',
            primary: true,
          },
          {
            label: 'Powód',
            value: 'Brak wolnych posiadłości startowych w Dzielnicy A.',
            tone: 'danger',
            multiline: true,
          },
        ],
      }),
    });

    fixture.detectChanges();

    const text = textContent(fixture);
    const cta = findContinueButton(fixture);
    expect(text).toContain('0 / 5000 wolnych posiadłości startowych');
    expect(text).toContain('Brak wolnych posiadłości startowych w Dzielnicy A.');
    expect(cta?.componentInstance.disabled).toBeTrue();
  });

  it('opens the hero creation stage through the eligible CTA', () => {
    const fixture = createFixture(true);

    fixture.detectChanges();
    findContinueButton(fixture)?.triggerEventHandler('onClick', {});
    fixture.detectChanges();

    const text = textContent(fixture);
    expect(fixture.componentInstance.page.continueToHeroCreation).toHaveBeenCalled();
    expect(text).toContain('Nazwa bohatera');
    expect(fixture.debugElement.query(By.css('app-step-origin'))).toBeTruthy();
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

interface FixtureInput {
  details?: CreateCharacterServerDetails;
}

function createFixture(
  hasExistingAccount: boolean,
  input: FixtureInput = {},
): ComponentFixture<CreateCharacterPage> {
  TestBed.resetTestingModule();
  const facade = facadeStub(hasExistingAccount, input);

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

function facadeStub(
  hasExistingAccount: boolean,
  input: FixtureInput,
): Partial<CreateCharacterPageFacade> {
  const form = createForm();
  const step = signal(1);
  const existingAccountCreateStage = signal<'server_select' | 'hero_creation'>('server_select');
  const selectedAvailability = availability();
  const selectedDetails = signal(input.details ?? details());

  return {
    accountForm: form.controls.account,
    canOpenStep: () => true,
    errorMessage: signal<string | null>(null).asReadonly(),
    form,
    hasExistingAccount: signal(hasExistingAccount).asReadonly(),
    heroForm: form.controls.hero,
    isSubmitting: signal(false).asReadonly(),
    nextFromAccount: jasmine.createSpy('nextFromAccount'),
    nextFromHero: jasmine.createSpy('nextFromHero').and.callFake(() => step.set(3)),
    onOriginNext: jasmine.createSpy('onOriginNext'),
    prevStep: jasmine.createSpy('prevStep'),
    profileForm: form.controls.profile,
    selectedOrigin: signal(null).asReadonly(),
    selectedServer: signal(null).asReadonly(),
    selectedServerAvailability: signal(selectedAvailability).asReadonly(),
    creationServerOptions: signal<CreateCharacterServerOption[]>([{
      id: selectedAvailability.serverId,
      label: selectedAvailability.serverName,
      availability: selectedAvailability,
    }]).asReadonly(),
    selectedServerDetails: selectedDetails.asReadonly(),
    existingAccountCreateStage: existingAccountCreateStage.asReadonly(),
    continueToHeroCreation: jasmine.createSpy('continueToHeroCreation')
      .and.callFake(() => existingAccountCreateStage.set('hero_creation')),
    selectCreationServer: jasmine.createSpy('selectCreationServer'),
    serverAvailabilityError: signal<string | null>(null).asReadonly(),
    step: step.asReadonly(),
    onStepChange: jasmine.createSpy('onStepChange'),
    submit: jasmine.createSpy('submit'),
    user: signal(hasExistingAccount ? { id: 'user-1', email: 'hero@example.com' } : null).asReadonly(),
  } as unknown as Partial<CreateCharacterPageFacade>;
}

function details(
  patch: Partial<CreateCharacterServerDetails> = {},
): CreateCharacterServerDetails {
  return {
    title: 'Sandbox',
    description: 'Sandbox server.',
    badges: [
      { label: 'Sandbox/test', tone: 'muted' },
      { label: 'Tworzenie dostępne', tone: 'success' },
    ],
    summaryRows: [
      { label: 'Tworzenie', value: 'Tworzenie dostępne', primary: true },
      { label: 'Status świata', value: 'live' },
    ],
    sideRows: [
      { label: 'Następny krok', value: 'Tworzenie bohatera' },
      { label: 'Domyślne wejście', value: 'tworzenie bohatera' },
      { label: 'Typ świata', value: 'Sandbox/test' },
      { label: 'Twój bohater', value: 'Brak bohatera na tym świecie' },
    ],
    footerTitle: 'Przejdź do tworzenia bohatera',
    footerCopy: 'Wybrany świat: Sandbox.',
    ctaLabel: 'Przejdź do tworzenia bohatera',
    canContinue: true,
    disabledReason: null,
    ...patch,
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
    ...patch,
  };
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

function findContinueButton(fixture: ComponentFixture<CreateCharacterPage>) {
  return fixture.debugElement
    .queryAll(By.css('p-button'))
    .find((entry) => entry.componentInstance.label === 'Przejdź do tworzenia bohatera');
}

function textContent(fixture: ComponentFixture<CreateCharacterPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}
