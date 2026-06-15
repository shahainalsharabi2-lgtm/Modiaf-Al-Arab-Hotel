import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../ui-inline-text/ui-inline-text.component';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { HotelAuthService } from '../../services/hotel-auth.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';

type AccountHubLink = {
  labelKey: string;
  icon: string;
  path: string;
  queryParams?: Record<string, string>;
  action?: 'db-settings';
};

@Component({
  selector: 'app-account-hub-panel',
  standalone: true,
  imports: [CommonModule, UiInlineTextComponent],
  templateUrl: './account-hub-panel.component.html',
  styleUrls: ['./account-hub-panel.component.css'],
})
export class AccountHubPanelComponent {
  readonly ui = inject(UiTranslationsService);
  private readonly auth = inject(HotelAuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() open = false;
  @Input() userLabel = '';
  @Input() userInitial = 'م';

  @Output() closed = new EventEmitter<void>();
  @Output() openDbSettings = new EventEmitter<void>();

  readonly favoriteLinks: AccountHubLink[] = [
    { labelKey: 'accountHubHome', icon: 'fa-chart-bar', path: '/dashboard' },
    { labelKey: 'accountHubBookings', icon: 'fa-calendar-check', path: '/front-desk', queryParams: { pmsTab: 'arriving' } },
    { labelKey: 'accountHubRoomPlan', icon: 'fa-table', path: '/nav/bookings/navRoomsSchedule' },
    { labelKey: 'accountHubDbSettings', icon: 'fa-shield-halved', path: '', action: 'db-settings' },
  ];

  constructor() {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  get userEmail(): string {
    return this.auth.currentUser()?.email?.trim() || '';
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open) {
      this.requestClose();
    }
  }

  requestClose(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    this.requestClose();
  }

  onPanelClick(event: Event): void {
    event.stopPropagation();
  }

  openMyAccount(): void {
    this.ui.inlineTranslationMode.set(false);
    this.requestClose();
    void this.router.navigate(['/account/manage']);
  }

  navigateLink(link: AccountHubLink): void {
    if (link.action === 'db-settings') {
      this.requestClose();
      this.openDbSettings.emit();
      return;
    }
    this.requestClose();
    void this.router.navigate([link.path], {
      queryParams: link.queryParams ?? null,
    });
  }

  logout(): void {
    this.auth.logout();
    this.requestClose();
    void this.router.navigate(['/login']);
  }
}
