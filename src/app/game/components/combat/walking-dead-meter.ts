import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CombatTimingStrikeSnapshot } from '../../../core/domain/combat/combat-display.model';

@Component({
  selector: 'app-walking-dead-meter',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './walking-dead-meter.html',
  styleUrl: './walking-dead-meter.scss',
  host: { class: 'd-block w-100' },
})
export class WalkingDeadMeter {
  private readonly lane = viewChild<ElementRef<HTMLElement>>('lane');
  private readonly indicator = viewChild<ElementRef<HTMLElement>>('indicator');

  readonly manifestId = input.required<string>();
  readonly position = input.required<number>();
  readonly zoneStart = input.required<number>();
  readonly zoneEnd = input.required<number>();
  readonly disabled = input(false);
  readonly actionLabel = input.required<string>();
  readonly actionLoading = input(false);

  readonly strike = output<CombatTimingStrikeSnapshot>();

  onFieldClick() {
    if (this.disabled()) {
      return;
    }

    this.strike.emit(this.snapshot());
  }

  private snapshot(): CombatTimingStrikeSnapshot {
    const laneRect = this.lane()?.nativeElement.getBoundingClientRect() ?? null;
    const indicatorRect = this.indicator()?.nativeElement.getBoundingClientRect() ?? null;
    const position = this.position();
    const visualCenterPx = laneRect && indicatorRect
      ? indicatorRect.left + indicatorRect.width / 2 - laneRect.left
      : null;
    const markerVisualCenterPercent = laneRect && visualCenterPx !== null && laneRect.width > 0
      ? (visualCenterPx / laneRect.width) * 100
      : null;
    const submittedPositionPercent = markerVisualCenterPercent === null
      ? position
      : Math.max(0, Math.min(100, markerVisualCenterPercent));

    return {
      manifestId: this.manifestId(),
      positionPercent: submittedPositionPercent,
    };
  }
}
