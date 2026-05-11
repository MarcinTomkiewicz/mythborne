import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { StartFlowOriginOption } from '../../../core/domain/start-flow/start-flow.model';
import { StartFlow } from '../../../core/services/start-flow/start-flow';
import { CreateCharacterForm } from '../../../core/types/forms/create-character-form.types';
import { CreateCharacterPage } from './create-character-page';
import { CreateCharacterPageFacade } from '../../../core/services/hero/create-character-page.facade';
import { StepHero } from './components/steps/step-hero';

describe('CreateCharacterPage', () => {
  it('shows only hero and origin steps for an existing account hero creation flow', () => {
    const fixture = createFixture(true);

    fixture.detectChanges();

    const text = textContent(fixture);
    expect(text).toContain('Hero');
    expect(text).toContain('Origin');
    expect(text).not.toContain('Account');
    expect(text).not.toContain('Profile');
    expect(text).not.toContain('Tell us about yourself');
  });

  it('shows the origin panel after Hero next in an existing account flow', () => {
    const fixture = createFixture(true);

    fixture.detectChanges();
    fixture.debugElement.query(By.directive(StepHero)).componentInstance.next.emit();
    fixture.detectChanges();

    expect(textContent(fixture)).toContain('Wybierz pochodzenie');
  });

  it('keeps account and profile steps for the unauthenticated new account flow', () => {
    const fixture = createFixture(false);

    fixture.detectChanges();

    const text = textContent(fixture);
    expect(text).toContain('Account');
    expect(text).toContain('Hero');
    expect(text).toContain('Origin');
    expect(text).toContain('Profile');
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
    key: 'nomad',
    name: 'Nomad',
    description: 'Nomad origin.',
    imageUrl: null,
    createdAt: '2026-05-01T10:00:00Z',
    originId: 'origin-1',
    originKey: 'nomad',
    originLabel: 'Nomad',
    originDescription: 'Nomad origin.',
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
