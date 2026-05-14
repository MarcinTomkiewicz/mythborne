import { MessageService } from 'primeng/api';

export function addCreateCharacterToast(
  messageService: MessageService,
  severity: 'info' | 'success' | 'warn' | 'error',
  summary: string,
  detail: string,
): void {
  const severityClassMap = {
    info: 'mg-toast mg-toast--info',
    success: 'mg-toast mg-toast--success',
    warn: 'mg-toast mg-toast--arcane',
    error: 'mg-toast mg-toast--danger',
  } as const;

  messageService.add({
    key: 'global',
    severity,
    summary,
    detail,
    life: severity === 'info' ? 2500 : 4500,
    styleClass: severityClassMap[severity],
  });
}
