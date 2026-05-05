import { inject, Injectable } from '@angular/core';
import { ToastService } from '../ui/toast';

@Injectable({ providedIn: 'root' })
export class MansionBuildingActionFeedback {
  private readonly toast = inject(ToastService);

  showUnavailable(message: string): void {
    this.toast.show('warn', 'Building action unavailable', message);
  }

  startSuccessMessage(buildingName: string, targetLevel: number): string {
    return `${buildingName} started to level ${targetLevel}.`;
  }

  showStartSuccess(message: string): void {
    this.toast.show(
      'success',
      'Building started',
      `${message} Completion is tracked by the active building job.`,
    );
  }

  showStartError(message: string): void {
    this.toast.show('error', 'Building start failed', message);
  }
}
