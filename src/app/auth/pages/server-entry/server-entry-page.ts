import { Component, DestroyRef, OnInit, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { StartFlowEntryState } from '../../../core/services/start-flow/start-flow-entry.state';
import { AccountEntryHeroSelector } from './account-entry-hero-selector';
import {
  mapServerEntryHeroContextOptions,
  ServerEntryHeroContextOption,
} from './server-entry-page.model';

@Component({
  selector: 'app-server-entry-page',
  standalone: true,
  host: {
    class: 'd-block w-100',
  },
  imports: [AccountEntryHeroSelector, ButtonModule, RouterLink],
  providers: [StartFlowEntryState],
  templateUrl: './server-entry-page.html',
})
export class ServerEntryPage implements OnInit {
  readonly state = inject(StartFlowEntryState);
  private readonly destroyRef = inject(DestroyRef);

  readonly heroContextForm = new FormGroup({
    selectedContextId: new FormControl<string | null>(null),
  });
  readonly selectedHeroContextControl = this.heroContextForm.controls.selectedContextId;
  private readonly selectedHeroContextId = signal<string | null>(null);
  readonly playableHeroContextOptions = computed<ServerEntryHeroContextOption[]>(() =>
    mapServerEntryHeroContextOptions(
      this.state.visibleAvailability(),
      this.state.accountEntryHeroContexts(),
      this.state.activeHeroState()?.heroId ?? null,
    )
  );
  readonly hasPlayableHeroContext = computed(() =>
    this.playableHeroContextOptions().length > 0,
  );
  readonly selectedHeroContext = computed<ServerEntryHeroContextOption | null>(() => {
    const options = this.playableHeroContextOptions();
    const selectedId = this.selectedHeroContextId();
    const selected = selectedId
      ? options.find((option) => option.id === selectedId) ?? null
      : null;

    return selected ??
      options.find((option) => option.isActive) ??
      options.find((option) => option.isDefault) ??
      options[0] ??
      null;
  });

  private readonly selectedHeroContextSync = effect(() => {
    const selectedContext = this.selectedHeroContext();
    const selectedId = selectedContext?.id ?? null;

    if (this.selectedHeroContextId() !== selectedId) {
      this.selectedHeroContextId.set(selectedId);
    }

    if (this.selectedHeroContextControl.value !== selectedId) {
      this.selectedHeroContextControl.setValue(selectedId, { emitEvent: false });
    }
  });

  private readonly selectedHeroContextControlChanges =
    this.selectedHeroContextControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.selectedHeroContextId.set(value));

  ngOnInit(): void {
    this.state.load();
  }

  enterSelectedHeroContext(): void {
    const context = this.selectedHeroContext();

    if (!context) {
      return;
    }

    this.state.enterHeroContext(context.serverId, context.heroId);
  }
}
