import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-walking-dead-meter',
  standalone: true,
  templateUrl: './walking-dead-meter.html',
  styleUrl: './walking-dead-meter.scss',
  host: { class: 'd-block w-100' },
})
export class WalkingDeadMeter {
  readonly position = input.required<number>();
  readonly zoneStart = input.required<number>();
  readonly zoneEnd = input.required<number>();
  readonly disabled = input(false);

  readonly strike = output<void>();

  onFieldClick() {
    if (this.disabled()) {
      return;
    }

    this.strike.emit();
  }
}
