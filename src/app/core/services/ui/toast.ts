import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastSeverity } from '../../types/toast.types';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messageService = inject(MessageService);

  show(severity: ToastSeverity, summary: string, detail: string) {
    const severityClassMap = {
      info: 'mg-toast mg-toast--info',
      success: 'mg-toast mg-toast--success',
      warn: 'mg-toast mg-toast--arcane',
      error: 'mg-toast mg-toast--danger',
    } as const;

    this.messageService.add({
      key: 'global',
      severity,
      summary,
      detail,
      life: severity === 'info' ? 2500 : 4500,
      styleClass: severityClassMap[severity],
    });
  }

  clear() {
    this.messageService.clear('global');
  }
}
