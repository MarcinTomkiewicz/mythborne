import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';
import { RewardProfileAdminData } from '../../../core/domain/exploration/exploration-reward.model';
import { ExplorationLabPreviews } from '../../../core/services/exploration/exploration-lab-previews';
import { RewardProfileAdmin } from '../../../core/services/exploration/reward-profile-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { RewardProfileEntryActionsState } from './reward-profile-entry-actions.state';
import { RewardProfileEntriesSection } from './reward-profile-entries-section';
import { RewardProfileOutcomeActionsState } from './reward-profile-outcome-actions.state';
import { RewardProfilePreviewState } from './reward-profile-preview.state';
import { RewardProfileProfileActionsState } from './reward-profile-profile-actions.state';
import { RewardProfilesPageState } from './reward-profiles-page.state';

describe('RewardProfilesPageState', () => {
  let admin: jasmine.SpyObj<RewardProfileAdmin>;
  let toast: jasmine.SpyObj<ToastService>;
  let page: RewardProfilesPageState;
  let profileActions: RewardProfileProfileActionsState;
  let entryActions: RewardProfileEntryActionsState;
  let outcomeActions: RewardProfileOutcomeActionsState;

  beforeEach(() => {
    admin = jasmine.createSpyObj<RewardProfileAdmin>('RewardProfileAdmin', [
      'getAdminData',
      'upsertProfile',
      'deactivateProfile',
      'upsertEntry',
      'deactivateEntry',
      'upsertOutcomeKind',
      'deactivateOutcomeKind',
    ]);
    admin.getAdminData.and.returnValue(of(adminData()));
    admin.upsertProfile.and.returnValue(of(adminData().profiles[0]));
    admin.upsertEntry.and.returnValue(of(adminData().entries[0]));
    admin.upsertOutcomeKind.and.returnValue(of(adminData().outcomeKinds[0]));
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      imports: [RewardProfileEntriesSection],
      providers: [
        RewardProfilesPageState,
        RewardProfileProfileActionsState,
        RewardProfileEntryActionsState,
        RewardProfileOutcomeActionsState,
        RewardProfilePreviewState,
        { provide: RewardProfileAdmin, useValue: admin },
        {
          provide: ExplorationLabPreviews,
          useValue: jasmine.createSpyObj<ExplorationLabPreviews>('ExplorationLabPreviews', [
            'previewRewardProfile',
          ]),
        },
        { provide: ToastService, useValue: toast },
      ],
    });
    page = TestBed.inject(RewardProfilesPageState);
    profileActions = TestBed.inject(RewardProfileProfileActionsState);
    entryActions = TestBed.inject(RewardProfileEntryActionsState);
    outcomeActions = TestBed.inject(RewardProfileOutcomeActionsState);
  });

  it('keeps dropdown form values editable and patches existing entry/outcome selections', () => {
    page.loadInitialData();

    entryActions.startNewEntry();
    page.entryForm.controls.entryKind.setValue('resource');
    page.outcomeForm.controls.sourceKind.setValue('trial');

    expect(page.entryForm.controls.entryKind.value).toBe('resource');
    expect(page.outcomeForm.controls.sourceKind.value).toBe('trial');

    page.selectEntry('entry-1');
    page.selectOutcome(adminData().outcomeKinds[0]);

    expect(page.entryForm.controls.entryKind.value).toBe('experience');
    expect(page.entryForm.controls.entryId.value).toBe('entry-1');
    expect(page.outcomeForm.controls.sourceKind.value).toBe('encounter');
    expect(page.outcomeForm.controls.key.value).toBe('success');
  });

  it('does not wrap p-select controls in native labels in entry template', () => {
    page.loadInitialData();
    entryActions.startNewEntry();
    page.entryForm.controls.entryKind.setValue('resource');

    const fixture = TestBed.createComponent(RewardProfileEntriesSection);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('label p-select').length).toBe(0);
  });

  it('updates entry form control when selecting an option through rendered p-select', async () => {
    page.loadInitialData();
    entryActions.startNewEntry();
    const fixture = TestBed.createComponent(RewardProfileEntriesSection);
    fixture.detectChanges();

    selectPrimeOption(fixture, 'p-select[formcontrolname="entryKind"]', 'resource');
    fixture.detectChanges();

    expect(page.entryForm.controls.entryKind.value).toBe('resource');
  });

  it('builds resource type options from DB dictionary and keeps referenced inactive values readable', () => {
    const data = adminData();
    admin.getAdminData.and.returnValue(of({
      ...data,
      entries: [{
        ...data.entries[0],
        entryKind: 'resource',
        resourceType: 'legacy_resource',
      }],
      resourceTypes: [
        data.resourceTypes[0],
        {
          key: 'legacy_resource',
          label: 'Legacy resource',
          description: 'Legacy resource.',
          helperText: null,
          adminDescription: null,
          sortOrder: 20,
          isActive: false,
          metadataJson: {},
          createdAt: '2026-05-01T10:00:00.000Z',
          updatedAt: '2026-05-01T10:00:00.000Z',
        },
      ],
    }));

    page.loadInitialData();

    expect(page.hasResourceTypeDictionary()).toBeTrue();
    expect(page.resourceTypeOptions()).toEqual([
      { label: 'Drachma (drachma)', value: 'drachma' },
      { label: 'Legacy resource (legacy_resource) - inactive referenced', value: 'legacy_resource' },
    ]);
    expect(page.resourceTypeLabel('legacy_resource')).toBe(
      'Legacy resource (legacy_resource) - inactive',
    );
  });

  it('builds entry kind, amount mode and source kind options from DB dictionaries', () => {
    page.loadInitialData();

    expect(page.categoryOptions()).toEqual([
      { label: 'Encounter', value: 'encounter' },
      { label: 'Level Up', value: 'level_up' },
      { label: 'Test', value: 'test' },
      { label: 'Trial', value: 'trial' },
    ]);
    expect(page.entryKindOptions()).toEqual([
      { label: 'Experience (experience)', value: 'experience' },
      { label: 'Resource (resource)', value: 'resource' },
      { label: 'Item generation (item_generation)', value: 'item_generation' },
      { label: 'Exploration effect (exploration_effect)', value: 'exploration_effect' },
    ]);
    expect(page.amountModeOptions()).toEqual([
      { label: 'Fixed (fixed)', value: 'fixed' },
      { label: 'Formula (formula)', value: 'formula' },
    ]);
    expect(page.sourceKindOptions()).toEqual([
      { label: 'Encounter (encounter)', value: 'encounter' },
    ]);
  });

  it('blocks active experience entries on level-up reward profiles to preserve recursion guard', () => {
    const data = adminData();
    admin.getAdminData.and.returnValue(of({
      ...data,
      profiles: [{
        ...data.profiles[0],
        category: 'level_up',
      }],
    }));
    page.loadInitialData();
    entryActions.startNewEntry();
    page.entryForm.patchValue({
      entryKind: 'experience',
      label: 'Recursive XP',
      description: 'Invalid level-up XP entry.',
      amountMode: 'fixed',
      minAmount: 10,
      maxAmount: 10,
      isActive: true,
      reason: 'Test guard.',
    });

    entryActions.saveEntry();

    expect(page.selectedLevelUpRoutingAwareness().isLevelUpProfile).toBeTrue();
    expect(page.error()).toBe(
      'Level-up reward profiles cannot contain active experience entries; this would create XP reward recursion.',
    );
    expect(admin.upsertEntry).not.toHaveBeenCalled();
  });

  it('filters reward amount modes by selected entry kind and forces none for non-numeric entries', () => {
    page.loadInitialData();
    entryActions.startNewEntry();

    expect(page.amountModeOptionsForEntryKind('experience')).toEqual([
      { label: 'Fixed (fixed)', value: 'fixed' },
      { label: 'Formula (formula)', value: 'formula' },
    ]);

    page.entryForm.controls.entryKind.setValue('item_generation');

    expect(page.entryForm.controls.amountMode.value).toBe('none');
    expect(page.amountModeOptionsForEntryKind('item_generation')).toEqual([
      { label: 'None (none)', value: 'none' },
    ]);

    page.entryForm.controls.entryKind.setValue('exploration_effect');

    expect(page.entryForm.controls.amountMode.value).toBe('none');
    expect(page.amountModeOptionsForEntryKind('exploration_effect')).toEqual([
      { label: 'None (none)', value: 'none' },
    ]);
  });

  it('keeps numeric reward amount modes for experience, character points and resources only', () => {
    page.loadInitialData();

    expect(page.amountModeOptionsForEntryKind('experience').map((option) => option.value)).toEqual([
      'fixed',
      'formula',
    ]);
    expect(page.amountModeOptionsForEntryKind('character_points').map((option) => option.value)).toEqual([
      'fixed',
      'formula',
    ]);
    expect(page.amountModeOptionsForEntryKind('resource').map((option) => option.value)).toEqual([
      'fixed',
      'formula',
    ]);
    expect(
      page.amountModeOptionsForEntryKind('experience').some(
        (option) => option.value === 'transfer_formula',
      ),
    ).toBeFalse();
  });

  it('saves item generation entries with none amount mode and without numeric formula fields', () => {
    page.loadInitialData();
    entryActions.startNewEntry();
    page.entryForm.patchValue({
      entryKind: 'item_generation',
      label: 'Generated item',
      description: 'Generated item reward.',
      amountMode: 'none',
      minAmount: 99,
      maxAmount: 100,
      formulaId: 'formula-1',
      minItemCount: 1,
      maxItemCount: 2,
      maxQualityKey: 'rare',
      bucketProfileId: 'bucket-1',
      reason: 'Tune item reward.',
    });

    entryActions.saveEntry();

    expect(admin.upsertEntry).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        entryKind: 'item_generation',
        amountMode: 'none',
        minAmount: null,
        maxAmount: null,
        formulaId: null,
        minItemCount: 1,
        maxItemCount: 2,
        maxQualityKey: 'rare',
        bucketProfileId: 'bucket-1',
      }),
    );
  });

  it('saves exploration effect entries with none amount mode and without numeric formula fields', () => {
    page.loadInitialData();
    entryActions.startNewEntry();
    page.entryForm.patchValue({
      entryKind: 'exploration_effect',
      label: 'Blessing effect',
      description: 'Effect reward.',
      amountMode: 'none',
      minAmount: 99,
      maxAmount: 100,
      formulaId: 'formula-1',
      effectDefinitionId: 'effect-1',
      reason: 'Tune effect reward.',
    });

    entryActions.saveEntry();

    expect(admin.upsertEntry).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        entryKind: 'exploration_effect',
        amountMode: 'none',
        minAmount: null,
        maxAmount: null,
        formulaId: null,
        effectDefinitionId: 'effect-1',
      }),
    );
  });

  it('generates keys from labels for new reward profiles and keeps existing keys stable', () => {
    page.loadInitialData();

    profileActions.startNewProfile();
    page.profileForm.controls.label.setValue('Nagroda za lekka walke!');

    expect(page.profileForm.controls.key.value).toBe('nagroda-za-lekka-walke');

    page.selectProfile('profile-1');
    TestBed.flushEffects();
    page.profileForm.controls.label.setValue('Renamed reward');

    expect(page.profileForm.controls.key.value).toBe('encounter-reward');
  });

  it('does not call profile RPC without inline reason or with invalid metadata', () => {
    page.loadInitialData();
    page.profileForm.patchValue({
      label: 'Encounter reward',
      description: 'Reward.',
      reason: '',
    });

    profileActions.saveProfile();

    expect(admin.upsertProfile).not.toHaveBeenCalled();
    expect(profileActions.reasonError()).toBe('Reason is required for this admin mutation.');
    expect(page.error()).toBeNull();

    page.profileForm.patchValue({
      metadataJsonText: '[',
      reason: 'Tune reward.',
    });

    profileActions.saveProfile();

    expect(admin.upsertProfile).not.toHaveBeenCalled();
    expect(page.error()).toBe('Metadata must be a valid JSON object.');
  });

  it('clears profile reason validation state after successful save', () => {
    page.loadInitialData();
    page.profileForm.patchValue({ reason: '' });

    profileActions.saveProfile();

    expect(profileActions.reasonError()).toBe('Reason is required for this admin mutation.');

    page.profileForm.patchValue({ reason: 'Tune reward.' });
    profileActions.saveProfile();

    expect(profileActions.reasonError()).toBeNull();
    expect(page.profileForm.controls.reason.touched).toBeFalse();
    expect(toast.show).toHaveBeenCalledWith('success', 'Reward profiles', 'Reward profile saved.');
  });

  it('ignores stale profile success after selection changes', () => {
    const save = new Subject<RewardProfileAdminData['profiles'][number]>();
    admin.upsertProfile.and.returnValue(save.asObservable());
    page.loadInitialData();
    page.profileForm.patchValue({ reason: 'Tune reward.' });

    profileActions.saveProfile();
    page.selectProfile(null);
    save.next(adminData().profiles[0]);
    save.complete();

    expect(toast.show).not.toHaveBeenCalled();
    expect(page.selectedProfileId()).toBeNull();
  });

  it('ignores stale entry and outcome successes after selection changes', () => {
    const entrySave = new Subject<RewardProfileAdminData['entries'][number]>();
    const outcomeSave = new Subject<RewardProfileAdminData['outcomeKinds'][number]>();
    admin.upsertEntry.and.returnValue(entrySave.asObservable());
    admin.upsertOutcomeKind.and.returnValue(outcomeSave.asObservable());
    page.loadInitialData();

    page.selectEntry('entry-1');
    page.entryForm.patchValue({ reason: 'Tune entry.' });
    entryActions.saveEntry();
    page.selectEntry(null);
    entrySave.next(adminData().entries[0]);
    entrySave.complete();

    expect(toast.show).not.toHaveBeenCalled();
    expect(page.selectedEntryId()).toBeNull();

    page.selectOutcome(adminData().outcomeKinds[0]);
    page.outcomeForm.patchValue({ reason: 'Tune outcome.' });
    outcomeActions.saveOutcome();
    page.outcomeForm.controls.sourceKind.setValue('trial');
    outcomeSave.next(adminData().outcomeKinds[0]);
    outcomeSave.complete();

    expect(toast.show).not.toHaveBeenCalled();
    expect(page.outcomeForm.controls.sourceKind.value).toBe('trial');
  });
});

function adminData(): RewardProfileAdminData {
  return {
    outcomeKinds: [
      {
        sourceKind: 'encounter',
        key: 'success',
        label: 'Success',
        description: 'Encounter success.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    profiles: [
      {
        id: 'profile-1',
        key: 'encounter-reward',
        label: 'Encounter reward',
        category: 'encounter',
        description: 'Reward.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    entries: [
      {
        id: 'entry-1',
        rewardProfileId: 'profile-1',
        entryKind: 'experience',
        label: 'Experience',
        description: 'Experience reward.',
        helperText: null,
        adminDescription: null,
        amountMode: 'fixed',
        minAmount: 5,
        maxAmount: 5,
        resourceType: null,
        formulaId: null,
        chancePercent: 100,
        minItemCount: null,
        maxItemCount: null,
        maxQualityKey: null,
        bucketProfileId: null,
        effectDefinitionId: null,
        transferSourceRole: null,
        transferRecipientRole: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    entryKinds: [
      {
        key: 'experience',
        label: 'Experience',
        description: 'Experience reward.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        key: 'resource',
        label: 'Resource',
        description: 'Resource reward.',
        helperText: null,
        adminDescription: null,
        sortOrder: 20,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        key: 'item_generation',
        label: 'Item generation',
        description: 'Generated item reward.',
        helperText: null,
        adminDescription: null,
        sortOrder: 30,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        key: 'exploration_effect',
        label: 'Exploration effect',
        description: 'Exploration effect reward.',
        helperText: null,
        adminDescription: null,
        sortOrder: 40,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    amountModes: [
      {
        key: 'none',
        label: 'None',
        description: 'No numeric reward amount.',
        helperText: null,
        adminDescription: null,
        sortOrder: 5,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        key: 'fixed',
        label: 'Fixed',
        description: 'Fixed amount.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        key: 'transfer_formula',
        label: 'Transfer formula',
        description: 'Reserved transfer amount.',
        helperText: null,
        adminDescription: null,
        sortOrder: 30,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        key: 'formula',
        label: 'Formula',
        description: 'Formula amount.',
        helperText: null,
        adminDescription: null,
        sortOrder: 20,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    sourceKinds: [
      {
        key: 'encounter',
        label: 'Encounter',
        description: 'Encounter source.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    resourceTypes: [
      {
        key: 'drachma',
        label: 'Drachma',
        description: 'Core currency.',
        helperText: 'Used for most rewards.',
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    formulas: [
      {
        id: 'formula-1',
        key: 'reward-amount',
        label: 'Reward amount',
        expression: '10',
        description: null,
        scopeKey: 'reward',
        isEnabled: true,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    qualities: [
      {
        key: 'rare',
        label: 'Rare',
        sortOrder: 10,
        isEnabled: true,
      },
    ],
    bucketProfiles: [
      {
        id: 'bucket-1',
        key: 'encounter-items',
        name: 'Encounter items',
        isActive: true,
      },
    ],
    effectDefinitions: [
      {
        id: 'effect-1',
        key: 'blessing',
        label: 'Blessing',
        effectKind: 'buff',
        isActive: true,
      },
    ],
  };
}

function selectPrimeOption(
  fixture: ReturnType<typeof TestBed.createComponent<RewardProfileEntriesSection>>,
  selector: string,
  optionValue: string,
): void {
  const select = fixture.debugElement.query(By.css(selector)).componentInstance;
  const option = select.options.find((entry: { value: string }) => entry.value === optionValue);

  select.onOptionSelect(new Event('click'), option);
}
