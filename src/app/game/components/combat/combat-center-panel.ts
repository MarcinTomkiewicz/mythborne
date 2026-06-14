import { Component, input, output } from '@angular/core';
import {
  CombatSurfaceCenterPanel as CombatSurfaceCenterPanelModel,
  CombatSurfaceActionId,
  CombatTimingStrikeSnapshot,
} from '../../../core/domain/combat/combat-display.model';
import { CombatCenterActionButton } from './combat-center-action-button';
import { WalkingDeadMeter } from './walking-dead-meter';
import { RichText } from '../../../shared/rich-text/rich-text';

@Component({
  selector: 'app-combat-center-panel',
  standalone: true,
  imports: [CombatCenterActionButton, RichText, WalkingDeadMeter],
  template: `
    <section class="mg-card p-lg flex-col gap-lg flex-1 min-w-0 w-100 h-100">
      @if (panel(); as model) {
        <div class="mg-card flex-col gap-sm text-center radius-md p-md">
          @if (model.contextLabel) {
            <span class="small-caps color-muted text-xs">{{ model.contextLabel }}</span>
          }
          @if (model.title) {
            <h3 class="color-heading text-xl mb-0">{{ model.title }}</h3>
          }
          @if (model.helperText) {
            <p class="color-text text-sm mb-0">{{ model.helperText }}</p>
          }
          @if (model.detailText) {
            <span class="color-muted text-sm">{{ model.detailText }}</span>
          }
          @if (model.richTextRows?.length) {
            <div class="flex-col gap-xs text-left w-100">
              @for (row of model.richTextRows; track $index) {
                <p class="color-text text-sm lh-16 m-0">
                  <app-rich-text [fragments]="row" />
                </p>
              }
            </div>
          }
        </div>

        @if (model.meter) {
          <app-walking-dead-meter
            [manifestId]="model.meter.manifestId"
            [position]="model.meter.position"
            [zoneStart]="model.meter.zoneStart"
            [zoneEnd]="model.meter.zoneEnd"
            [disabled]="model.meter.disabled"
            [actionLabel]="model.meter.actionLabel"
            [actionLoading]="model.meter.actionLoading"
            [title]="model.meter.title"
            [helperText]="model.meter.helperText"
            [earlyLabel]="model.meter.earlyLabel"
            [hitZoneLabel]="model.meter.hitZoneLabel"
            [lateLabel]="model.meter.lateLabel"
            (strike)="timingStrike.emit($event)"
          />
        } @else {
          @if (model.decisionDeadline; as deadline) {
            <div class="mg-card p-md flex-col gap-xs text-center w-100">
              <div class="flex-row-between-center gap-sm w-100">
                <span class="small-caps color-muted text-xs">{{ deadline.label }}</span>
                <strong class="color-heading text-md">{{ deadline.countdownLabel }}</strong>
              </div>
              <progress
                class="w-100"
                max="100"
                [value]="deadline.progressPercent"
                [attr.aria-label]="deadline.label"
              ></progress>
            </div>
          }

          @if (model.primaryAction || model.secondaryAction) {
            <div class="flex-row-center-center flex-wrap gap-sm">
              @if (model.primaryAction; as action) {
                <app-combat-center-action-button
                  [action]="action"
                  (selected)="centerAction.emit($event)"
                />
              }

              @if (model.secondaryAction; as action) {
                <app-combat-center-action-button
                  [action]="action"
                  (selected)="centerAction.emit($event)"
                />
              }
            </div>
          }
        }

        @if (model.footerAction; as action) {
          <div class="flex-col gap-xs text-center border-top pt-sm">
            <app-combat-center-action-button
              [action]="action"
              (selected)="centerAction.emit($event)"
            />
            @if (action.helperText) {
              <span class="color-muted text-sm">{{ action.helperText }}</span>
            }
          </div>
        }
      } @else {
        <ng-content select="[combatCenter]" />
      }
    </section>
  `,
  host: { class: 'd-flex flex-1 min-w-0 h-100' },
})
export class CombatCenterPanel {
  readonly panel = input<CombatSurfaceCenterPanelModel | null>(null);
  readonly centerAction = output<CombatSurfaceActionId>();
  readonly timingStrike = output<CombatTimingStrikeSnapshot>();
}
