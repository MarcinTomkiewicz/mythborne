import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { GuildConfigSummary } from '../../../core/domain/guild/guild.model';
import { ConfigChangeSets } from '../../../core/services/config/config-change-sets';
import { ConfigChangeSetWorkflow } from '../../../core/services/config/config-change-set-workflow';
import { ConfigDefinitions } from '../../../core/services/config/config-definitions';
import { ConfigValues } from '../../../core/services/config/config-values';
import { PlayerGuild } from '../../../core/services/guild/player-guild';
import { ToastService } from '../../../core/services/ui/toast';
import {
  ConfigChangeEntry,
  ConfigChangeSet,
} from '../../../core/types/config-governance.types';
import { GuildConfigEditorState } from './guild-config-editor.state';
import {
  changeEntry,
  changeSet,
  effectiveValues,
  guildConfigDefinitions,
} from './guild-config-editor.state.spec-fixtures';

describe('GuildConfigEditorState', () => {
  let state: GuildConfigEditorState;
  let changeSets: jasmine.SpyObj<ConfigChangeSets>;
  let configDefinitions: jasmine.SpyObj<ConfigDefinitions>;
  let configValues: jasmine.SpyObj<ConfigValues>;
  let playerGuild: jasmine.SpyObj<PlayerGuild>;
  let toast: jasmine.SpyObj<ToastService>;
  let workflow: jasmine.SpyObj<ConfigChangeSetWorkflow>;

  beforeEach(() => {
    changeSets = jasmine.createSpyObj<ConfigChangeSets>('ConfigChangeSets', [
      'createDraftChangeSet',
      'createConfigValueChangeEntry',
    ]);
    configDefinitions = jasmine.createSpyObj<ConfigDefinitions>(
      'ConfigDefinitions',
      ['getActiveDefinitionsByManagedEntityKey'],
    );
    configValues = jasmine.createSpyObj<ConfigValues>('ConfigValues', [
      'getEffectiveValues',
    ]);
    playerGuild = jasmine.createSpyObj<PlayerGuild>('PlayerGuild', [
      'getGuildConfigSummary',
    ]);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);
    workflow = jasmine.createSpyObj<ConfigChangeSetWorkflow>(
      'ConfigChangeSetWorkflow',
      ['markReady', 'apply'],
    );

    changeSets.createDraftChangeSet.and.returnValue(of(changeSet()));
    changeSets.createConfigValueChangeEntry.and.returnValue(of([changeEntry()]));
    configDefinitions.getActiveDefinitionsByManagedEntityKey.and.returnValue(
      of(guildConfigDefinitions()),
    );
    configValues.getEffectiveValues.and.returnValue(of(effectiveValues()));
    playerGuild.getGuildConfigSummary.and.returnValue(of(config()));
    workflow.markReady.and.returnValue(of(changeSet({ status: 'ready' })));
    workflow.apply.and.returnValue(of(changeSet({ status: 'applied' })));

    TestBed.configureTestingModule({
      providers: [
        GuildConfigEditorState,
        { provide: ConfigChangeSets, useValue: changeSets },
        { provide: ConfigChangeSetWorkflow, useValue: workflow },
        { provide: ConfigDefinitions, useValue: configDefinitions },
        { provide: ConfigValues, useValue: configValues },
        { provide: PlayerGuild, useValue: playerGuild },
        { provide: ToastService, useValue: toast },
      ],
    });

    state = TestBed.inject(GuildConfigEditorState);
  });

  it('loads current guild config and patches editable form', () => {
    state.load();

    expect(playerGuild.getGuildConfigSummary).toHaveBeenCalled();
    expect(state.config()?.creationDrachmaCost).toBe(1000);
    expect(state.form.controls.armoryCapacity.value).toBe(30);
  });

  it('applies changed guild config fields through canonical governance flow', () => {
    playerGuild.getGuildConfigSummary.and.returnValues(
      of(config()),
      of(config({ creationDrachmaCost: 5000, armoryCapacity: 0 })),
    );

    state.load();
    state.form.patchValue({
      creationDrachmaCost: 5000,
      armoryCapacity: 0,
      reason: 'Rebalance guild setup.',
    });
    state.applyGuildConfigChanges();

    expect(configDefinitions.getActiveDefinitionsByManagedEntityKey)
      .toHaveBeenCalledWith('guild');
    expect(changeSets.createDraftChangeSet).toHaveBeenCalledWith({
      title: 'Guild configuration update',
      reason: 'Rebalance guild setup.',
      changelogVisibility: 'none',
      changelogTitle: null,
      changelogBody: null,
    });
    expect(changeSets.createConfigValueChangeEntry).toHaveBeenCalledWith(
      jasmine.objectContaining({
        changeSetId: 'change-set-1',
        definition: jasmine.objectContaining({ key: 'guild_creation_drachma_cost' }),
        newValue: 5000,
      }),
    );
    expect(changeSets.createConfigValueChangeEntry).toHaveBeenCalledWith(
      jasmine.objectContaining({
        changeSetId: 'change-set-1',
        definition: jasmine.objectContaining({ key: 'guild_armory_capacity' }),
        newValue: 0,
      }),
    );
    expect(workflow.markReady).toHaveBeenCalledWith('change-set-1');
    expect(workflow.apply).toHaveBeenCalledWith('change-set-1');
    expect(playerGuild.getGuildConfigSummary).toHaveBeenCalledTimes(2);
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Guild config updated',
      'Guild configuration changes applied.',
    );
  });

  it('uses canonical prefixed config definition keys for every editable field', () => {
    playerGuild.getGuildConfigSummary.and.returnValues(
      of(config()),
      of(config({
        creationDrachmaCost: 5000,
        memberBaseLimit: 12,
        memberLimitPerLeaderLevel: 3,
        leaderInactivityThresholdDays: 20,
        nominationDurationMinutes: 480,
        votingDurationMinutes: 960,
        emergencyMaxCandidates: 4,
        armoryCapacity: 0,
      })),
    );

    state.load();
    state.form.patchValue({
      creationDrachmaCost: 5000,
      memberBaseLimit: 12,
      memberLimitPerLeaderLevel: 3,
      leaderInactivityThresholdDays: 20,
      nominationDurationMinutes: 480,
      votingDurationMinutes: 960,
      emergencyMaxCandidates: 4,
      armoryCapacity: 0,
      reason: 'Rebalance all guild config values.',
    });
    state.applyGuildConfigChanges();

    const definitionKeys = changeSets.createConfigValueChangeEntry.calls
      .allArgs()
      .map(([input]) => input.definition.key);

    expect(definitionKeys).toEqual([
      'guild_creation_drachma_cost',
      'guild_member_base_limit',
      'guild_member_limit_per_leader_level',
      'guild_leader_inactivity_threshold_days',
      'guild_emergency_nomination_duration_minutes',
      'guild_emergency_voting_duration_minutes',
      'guild_emergency_max_candidates',
      'guild_armory_capacity',
    ]);
  });

  it('validates required non-negative integer values and allows zero armory capacity', () => {
    state.load();

    state.form.controls.creationDrachmaCost.setValue(null);
    expect(state.form.controls.creationDrachmaCost.hasError('required')).toBeTrue();

    state.form.controls.creationDrachmaCost.setValue(-1);
    expect(state.form.controls.creationDrachmaCost.hasError('min')).toBeTrue();

    state.form.controls.creationDrachmaCost.setValue(1.25);
    expect(state.form.controls.creationDrachmaCost.hasError('integer')).toBeTrue();

    state.form.controls.creationDrachmaCost.setValue(5000);
    state.form.controls.armoryCapacity.setValue(0);
    expect(state.form.controls.armoryCapacity.valid).toBeTrue();
  });

  it('requires governance reason before applying guild config changes', () => {
    state.load();
    state.form.patchValue({
      creationDrachmaCost: 5000,
      reason: '   ',
    });

    state.applyGuildConfigChanges();

    expect(changeSets.createDraftChangeSet).not.toHaveBeenCalled();
    expect(state.form.controls.reason.hasError('trimRequired')).toBeTrue();
  });

  it('runs async workflow in order before reloading summary', () => {
    const events: string[] = [];
    const createDraft$ = new Subject<ConfigChangeSet>();
    const firstEntry$ = new Subject<ConfigChangeEntry[]>();
    const secondEntry$ = new Subject<ConfigChangeEntry[]>();
    const markReady$ = new Subject<ConfigChangeSet>();
    const apply$ = new Subject<ConfigChangeSet>();
    const reload$ = new Subject<GuildConfigSummary>();
    let entryCall = 0;

    playerGuild.getGuildConfigSummary.and.returnValues(of(config()), reload$);
    changeSets.createDraftChangeSet.and.callFake(() => {
      events.push('createDraft');
      return createDraft$;
    });
    changeSets.createConfigValueChangeEntry.and.callFake(() => {
      entryCall += 1;
      events.push(`entry:${entryCall}`);
      return entryCall === 1 ? firstEntry$ : secondEntry$;
    });
    workflow.markReady.and.callFake(() => {
      events.push('markReady');
      return markReady$;
    });
    workflow.apply.and.callFake(() => {
      events.push('apply');
      return apply$;
    });

    state.load();
    state.form.patchValue({
      creationDrachmaCost: 5000,
      armoryCapacity: 0,
      reason: 'Rebalance guild setup.',
    });
    state.applyGuildConfigChanges();

    expect(events).toEqual(['createDraft']);
    createDraft$.next(changeSet());
    expect(events).toEqual(['createDraft', 'entry:1']);
    firstEntry$.next([changeEntry()]);
    firstEntry$.complete();
    expect(events).toEqual(['createDraft', 'entry:1', 'entry:2']);
    secondEntry$.next([changeEntry({ id: 'entry-2' })]);
    secondEntry$.complete();
    expect(events).toEqual(['createDraft', 'entry:1', 'entry:2', 'markReady']);
    markReady$.next(changeSet({ status: 'ready' }));
    markReady$.complete();
    expect(events).toEqual([
      'createDraft',
      'entry:1',
      'entry:2',
      'markReady',
      'apply',
    ]);
    apply$.next(changeSet({ status: 'applied' }));
    apply$.complete();
    expect(playerGuild.getGuildConfigSummary).toHaveBeenCalledTimes(2);
    reload$.next(config({ creationDrachmaCost: 5000, armoryCapacity: 0 }));
    reload$.complete();
    expect(state.config()?.creationDrachmaCost).toBe(5000);
  });

  it('surfaces guild config read errors inline', () => {
    playerGuild.getGuildConfigSummary.and.returnValue(
      throwError(() => new Error('Guild config unavailable.')),
    );

    state.load();

    expect(state.error()).toBe('Guild config unavailable.');
  });
});

function config(overrides: Partial<GuildConfigSummary> = {}): GuildConfigSummary {
  return {
    creationDrachmaCost: 1000,
    memberBaseLimit: 10,
    memberLimitPerLeaderLevel: 2,
    leaderInactivityThresholdDays: 15,
    nominationDurationMinutes: 360,
    votingDurationMinutes: 720,
    emergencyMaxCandidates: 3,
    armoryCapacity: 30,
    armoryCapacityIsUnlimited: false,
    ...overrides,
  };
}
