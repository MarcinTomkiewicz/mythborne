import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-walking-dead-meter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './walking-dead-meter.html',
  styleUrl: './walking-dead-meter.scss',
})
export class WalkingDeadMeter {
  readonly position = input.required<number>();
  readonly zoneStart = input.required<number>();
  readonly zoneEnd = input.required<number>();
  readonly zoneWidth = input.required<number>();
  readonly speed = input.required<number>();
  readonly streak = input.required<number>();
  readonly disabled = input(false);

  readonly strike = output<void>();

  readonly viewWidth = 760;
  readonly viewHeight = 56;
  readonly indicatorX = () => (this.position() / 100) * this.viewWidth;
  readonly zoneX = () => (this.zoneStart() / 100) * this.viewWidth;
  readonly zoneSvgWidth = () => ((this.zoneEnd() - this.zoneStart()) / 100) * this.viewWidth;

  onFieldClick() {
    if (this.disabled()) {
      return;
    }

    this.strike.emit();
  }
}
