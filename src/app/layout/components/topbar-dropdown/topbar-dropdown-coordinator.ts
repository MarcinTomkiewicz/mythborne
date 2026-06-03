import {
  Directive,
  ElementRef,
  HostListener,
  Injectable,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

@Injectable()
export class TopbarDropdownCoordinator {
  private readonly activeDropdownId = signal<string | null>(null);

  isOpen(dropdownId: string): boolean {
    return this.activeDropdownId() === dropdownId;
  }

  toggle(dropdownId: string): void {
    this.activeDropdownId.update((current) =>
      current === dropdownId ? null : dropdownId,
    );
  }

  close(dropdownId: string): void {
    if (this.activeDropdownId() === dropdownId) {
      this.activeDropdownId.set(null);
    }
  }

  closeAll(): void {
    this.activeDropdownId.set(null);
  }
}

@Directive({
  selector: '[appDropdownOutsideClose]',
  standalone: true,
})
export class DropdownOutsideClose {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly isActive = input(false, { alias: 'appDropdownOutsideClose' });
  readonly outsideClick = output<void>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isActive()) {
      return;
    }

    const target = event.target;
    if (!target) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(target as Node)) {
      this.outsideClick.emit();
    }
  }
}
