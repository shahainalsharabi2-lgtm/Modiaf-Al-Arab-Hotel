import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../ui-inline-text/ui-inline-text.component';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { HotelAuthService } from '../../services/hotel-auth.service';
import { filter } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { ArabicPreferenceCategoryService } from '../../services/arabic-preference-category.service';
import { ArabicCategoryPickerService } from '../../services/arabic-category-picker.service';
import type { UiExtraLocaleCode } from '../../utils/ui-translation.constants';
import { formatLocalePickerLabel } from '../../utils/locale-picker-label';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { UI_LOCALE_PICKER_OPTIONS, type UiLocalePickerOption } from '../../utils/ui-locale-picker.util';
import { AppNotificationsPanelComponent } from '../app-notifications-panel/app-notifications-panel.component';
import { AccountHubPanelComponent } from '../account-hub-panel/account-hub-panel.component';
import { AppCalculatorModalComponent } from '../app-calculator-modal/app-calculator-modal.component';
import { DbSettingsPanelComponent } from '../db-settings-panel/db-settings-panel.component';
import { RoomStatusPanelComponent } from '../room-status-panel/room-status-panel.component';
import { KEYBOARD_SHORTCUTS, type KeyboardShortcutEntry } from '../keyboard-shortcuts/keyboard-shortcuts.config';

type TopBarLocale = UiLocalePickerOption['code'];

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    AppNotificationsPanelComponent,
    AccountHubPanelComponent,
    AppCalculatorModalComponent,
    DbSettingsPanelComponent,
    RoomStatusPanelComponent, UiInlineTextComponent],
  templateUrl: './app-top-bar.component.html',
  styleUrls: ['./app-top-bar.component.css'],
})
export class AppTopBarComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly arabicPref = inject(ArabicPreferenceCategoryService);
  private readonly arabicCategoryPicker = inject(ArabicCategoryPickerService);
  private readonly auth = inject(HotelAuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() hotelDisplayName = '';
  @Input() hotelImageSrc: string | null = null;
  @Input() hotelNameInitial = 'ف';
  @Input() unreadNotifications = 0;

  @Output() searchOpen = new EventEmitter<void>();

  readonly localeOptions = UI_LOCALE_PICKER_OPTIONS;
  readonly keyboardShortcuts = KEYBOARD_SHORTCUTS;

  breadcrumb = '';
  clockDate = '';
  clockTime = '';
  hotelMetaDate = '';
  langPickerOpen = false;
  notificationsOpen = false;
  shortcutsOpen = false;
  calculatorOpen = false;
  accountHubOpen = false;
  roomStatusOpen = false;
  dbPanelOpen = false;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    fromEvent(window, 'hotelArabicCategoryChanged')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
    this.updateBreadcrumb(this.router.url);
    this.tickClock();
    const clockTimer = window.setInterval(() => this.tickClock(), 30_000);

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        this.updateBreadcrumb(e.urlAfterRedirects);
        this.langPickerOpen = false;
        this.notificationsOpen = false;
        this.shortcutsOpen = false;
        this.calculatorOpen = false;
        this.accountHubOpen = false;
        this.roomStatusOpen = false;
        this.dbPanelOpen = false;
        this.cdr.markForCheck();
      });

    this.destroyRef.onDestroy(() => window.clearInterval(clockTimer));
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.calculatorOpen) {
        this.calculatorOpen = false;
        this.cdr.markForCheck();
        return;
      }
      if (this.shortcutsOpen) {
        this.shortcutsOpen = false;
        this.cdr.markForCheck();
        return;
      }
      if (this.notificationsOpen) {
        this.notificationsOpen = false;
        this.cdr.markForCheck();
        return;
      }
      if (this.dbPanelOpen) {
        this.dbPanelOpen = false;
        this.cdr.markForCheck();
        return;
      }
      if (this.roomStatusOpen) {
        this.roomStatusOpen = false;
        this.cdr.markForCheck();
        return;
      }
      if (this.accountHubOpen) {
        this.accountHubOpen = false;
        this.cdr.markForCheck();
        return;
      }
      if (this.langPickerOpen) {
        this.langPickerOpen = false;
        this.cdr.markForCheck();
      }
    }
  }

  localeLabel(labelKey: UiLocalePickerOption['labelKey']): string {
    const raw = this.ui.screenText('settings', labelKey);
    return formatLocalePickerLabel(raw, this.ui.displayLocale());
  }

  activeLocaleOption(): UiLocalePickerOption {
    const current = this.ui.displayLocale();
    const base = this.localeOptions.find((o) => o.code === current) ?? this.localeOptions[0];
    if (current === 'ar') {
      return {
        ...base,
        flagSrc: this.arabicPref.activeFlagSrc(),
        shortCode: this.arabicPref.activeShortCode(),
      };
    }
    return base;
  }

  otherLocaleOptions(): UiLocalePickerOption[] {
    const current = this.ui.displayLocale();
    return this.localeOptions.filter((o) => o.code !== current);
  }

  toggleLangPicker(event: Event): void {
    event.stopPropagation();
    this.langPickerOpen = !this.langPickerOpen;
    this.cdr.markForCheck();
  }

  closeLangPicker(): void {
    if (this.langPickerOpen) {
      this.langPickerOpen = false;
      this.cdr.markForCheck();
    }
  }

  toggleShortcuts(event: Event): void {
    event.stopPropagation();
    this.shortcutsOpen = !this.shortcutsOpen;
    if (this.shortcutsOpen) {
      this.closeFloatingPanels(['shortcuts']);
    }
    this.cdr.markForCheck();
  }

  toggleCalculator(event: Event): void {
    event.stopPropagation();
    this.calculatorOpen = !this.calculatorOpen;
    if (this.calculatorOpen) {
      this.closeFloatingPanels(['calculator']);
    }
    this.cdr.markForCheck();
  }

  toggleAccountHub(event: Event): void {
    event.stopPropagation();
    this.accountHubOpen = !this.accountHubOpen;
    if (this.accountHubOpen) {
      this.closeFloatingPanels(['accountHub']);
    }
    this.cdr.markForCheck();
  }

  closeAccountHub(): void {
    if (this.accountHubOpen) {
      this.accountHubOpen = false;
      this.cdr.markForCheck();
    }
  }

  toggleRoomStatusPanel(event: Event): void {
    event.stopPropagation();
    this.roomStatusOpen = !this.roomStatusOpen;
    if (this.roomStatusOpen) {
      this.closeFloatingPanels(['roomStatus']);
    }
    this.cdr.markForCheck();
  }

  closeRoomStatusPanel(): void {
    if (this.roomStatusOpen) {
      this.roomStatusOpen = false;
      this.cdr.markForCheck();
    }
  }

  openDbSettingsFromAccountHub(): void {
    this.accountHubOpen = false;
    this.dbPanelOpen = true;
    this.cdr.markForCheck();
  }

  closeCalculator(): void {
    if (this.calculatorOpen) {
      this.calculatorOpen = false;
      this.cdr.markForCheck();
    }
  }

  closeShortcuts(): void {
    if (this.shortcutsOpen) {
      this.shortcutsOpen = false;
      this.cdr.markForCheck();
    }
  }

  chromeTrKeys(...keys: string[]): string {
    return keys.join(',');
  }

  shortcutLabel(entry: KeyboardShortcutEntry): string {
    return this.ui.chromeLabel(entry.labelKey);
  }

  runShortcut(entry: KeyboardShortcutEntry, event?: Event): void {
    event?.stopPropagation();
    this.shortcutsOpen = false;
    void this.router.navigate([entry.path], {
      queryParams: entry.queryParams ?? null,
    });
    this.cdr.markForCheck();
  }

  selectLocale(code: TopBarLocale, event?: Event): void {
    event?.stopPropagation();
    this.langPickerOpen = false;
    if (this.ui.displayLocale() === code) {
      return;
    }
    if (code === 'ar') {
      this.arabicCategoryPicker.requestArabicLocaleSwitch(() =>
        this.ui.reloadFromBackend(() => this.cdr.markForCheck()),
      );
      return;
    }
    this.ui.setDisplayLocale(code);
    this.ui.reloadFromBackend(() => this.cdr.markForCheck());
  }

  openSearch(event: Event): void {
    event.stopPropagation();
    this.searchOpen.emit();
  }

  openNotifications(event: Event): void {
    event.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.closeFloatingPanels(['notifications']);
    }
    this.cdr.markForCheck();
  }

  closeNotifications(): void {
    if (this.notificationsOpen) {
      this.notificationsOpen = false;
      this.cdr.markForCheck();
    }
  }

  private tickClock(): void {
    const now = new Date();
    const loc = this.ui.displayLocale() === 'ar' ? 'ar-SA' : undefined;
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    this.hotelMetaDate = `${y}/${m}/${d}`;
    this.clockDate = now.toLocaleDateString(loc, {
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    this.clockTime = now.toLocaleTimeString(loc, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    this.cdr.markForCheck();
  }

  private updateBreadcrumb(url: string): void {
    const path = (url.split('?')[0] || '').replace(/\/$/, '') || '/';
    const params = new URLSearchParams(url.split('?')[1] || '');
    const home = this.ui.sidebarLabel('dashboard');

    if (path === '/dashboard' || path === '/') {
      this.breadcrumb = `/ ${home}`;
      return;
    }

    if (path === '/front-desk/room-plan') {
      this.breadcrumb = `${this.ui.sidebarLabel('frontDeskGroup')} / ${this.ui.sidebarLabel('navRoomPlan')}`;
      return;
    }

    if (path === '/front-desk/rooms-rack') {
      this.breadcrumb = `${this.ui.sidebarLabel('frontDeskGroup')} / ${this.ui.sidebarLabel('navRoomRack')}`;
      return;
    }

    if (path === '/front-desk/guest-valuables') {
      this.breadcrumb = `${this.ui.sidebarLabel('frontDeskGroup')} / ${this.ui.sidebarLabel('navGuestValuables')}`;
      return;
    }

    if (path === '/front-desk/keys') {
      this.breadcrumb = `${this.ui.sidebarLabel('frontDeskGroup')} / ${this.ui.sidebarLabel('navKeyManagement')} / ${this.ui.sidebarLabel('navKeys')}`;
      return;
    }

    if (path === '/front-desk/key-services') {
      this.breadcrumb = `${this.ui.sidebarLabel('frontDeskGroup')} / ${this.ui.sidebarLabel('navKeyManagement')} / ${this.ui.sidebarLabel('navKeyServices')}`;
      return;
    }

    if (path === '/cashier/rent-posting') {
      this.breadcrumb = `${this.ui.sidebarLabel('cashierGroup')} / ${this.ui.sidebarLabel('navRentPosting')}`;
      return;
    }

    if (path === '/cashier/previous-invoices') {
      this.breadcrumb = `${this.ui.sidebarLabel('cashierGroup')} / ${this.ui.sidebarLabel('navPreviousInvoices')}`;
      return;
    }

    if (path === '/cashier/invoices-notifications') {
      this.breadcrumb = `${this.ui.sidebarLabel('cashierGroup')} / ${this.ui.sidebarLabel('navInvoicesNotifications')}`;
      return;
    }

    if (path === '/crm/profile-settings') {
      this.breadcrumb = `${this.ui.sidebarLabel('crmGroup')} / ${this.ui.sidebarLabel('navCrmProfileSettings')}`;
      return;
    }

    if (path === '/crm/individuals') {
      this.breadcrumb = `${this.ui.sidebarLabel('crmGroup')} / ${this.ui.sidebarLabel('navCrmIndividuals')}`;
      return;
    }

    if (path === '/crm/companies') {
      this.breadcrumb = `${this.ui.sidebarLabel('crmGroup')} / ${this.ui.sidebarLabel('navCrmCompanies')}`;
      return;
    }

    if (path === '/crm/agents') {
      this.breadcrumb = `${this.ui.sidebarLabel('crmGroup')} / ${this.ui.sidebarLabel('navCrmAgents')}`;
      return;
    }

    if (path === '/night-auditor/settings') {
      this.breadcrumb = `${this.ui.sidebarLabel('nightAuditorGroup')} / ${this.ui.sidebarLabel('navNightAuditorSettings')}`;
      return;
    }

    if (path === '/night-auditor/reservations-review') {
      this.breadcrumb = `${this.ui.sidebarLabel('nightAuditorGroup')} / ${this.ui.sidebarLabel('navNightAuditReservations')}`;
      return;
    }

    if (path === '/night-auditor/procedure') {
      this.breadcrumb = `${this.ui.sidebarLabel('nightAuditorGroup')} / ${this.ui.sidebarLabel('navNightAuditProcedure')}`;
      return;
    }

    if (path === '/night-auditor/room-movement') {
      this.breadcrumb = `${this.ui.sidebarLabel('nightAuditorGroup')} / ${this.ui.sidebarLabel('navNightAuditRoomMovement')}`;
      return;
    }

    if (path === '/bookings') {
      this.breadcrumb = `${this.ui.sidebarLabel('bookingsGroup')} / ${this.ui.sidebarLabel('bookingsHub')}`;
      return;
    }

    if (path === '/front-desk/booking') {
      this.breadcrumb = `${this.ui.sidebarLabel('bookingsGroup')} / ${this.ui.sidebarLabel('navNewBooking')}`;
      return;
    }

    if (path === '/front-desk') {
      const fd = this.ui.sidebarLabel('frontDeskGroup');
      const tab = params.get('pmsTab');
      if (tab === 'arriving') {
        this.breadcrumb = `${fd} / ${this.ui.sidebarLabel('navArriving')}`;
        return;
      }
      if (tab === 'departing') {
        this.breadcrumb = `${fd} / ${this.ui.sidebarLabel('navDeparting')}`;
        return;
      }
      if (tab === 'staying') {
        this.breadcrumb = `${fd} / ${this.ui.sidebarLabel('navResidents')}`;
        return;
      }
      this.breadcrumb = `/ ${fd}`;
      return;
    }

    if (path === '/rooms') {
      this.breadcrumb = `${this.ui.sidebarLabel('bookingsGroup')} / ${this.ui.sidebarLabel('rooms')}`;
      return;
    }

    if (path.startsWith('/nav/bookings/')) {
      const itemKey = path.slice('/nav/bookings/'.length);
      this.breadcrumb = `${this.ui.sidebarLabel('bookingsGroup')} / ${this.ui.sidebarLabel(itemKey)}`;
      return;
    }

    if (path === '/reports') {
      const hub = params.get('hub');
      const reportsRoot = this.ui.sidebarLabel('reports');
      if (hub === 'advanced') {
        this.breadcrumb = `${reportsRoot} / ${this.ui.screenText('reports', 'hubAdvancedTitle')}`;
        return;
      }
      if (hub === 'template') {
        this.breadcrumb = `${reportsRoot} / ${this.ui.screenText('reports', 'hubTemplateTitle')}`;
        return;
      }
      if (hub === 'management') {
        this.breadcrumb = `${reportsRoot} / ${this.ui.screenText('reports', 'hubManagementTitle')}`;
        return;
      }
      this.breadcrumb = `/ ${reportsRoot}`;
      return;
    }

    if (path === '/my-account' || path === '/account/manage') {
      this.breadcrumb = `/ ${this.ui.chromeLabel('myAccountBtn')}`;
      return;
    }

    if (path === '/settings') {
      const tab = params.get('tab')?.trim() || 'general';
      const settingsTitle = this.ui.chromeLabel('helpSettingsLink');
      if (tab === 'translations') {
        this.breadcrumb = `${settingsTitle} / ${this.ui.screenText('settings', 'tabGeneralCodings')}`;
        return;
      }
      if (tab === 'uiTranslations') {
        this.breadcrumb = `${settingsTitle} / ${this.ui.screenText('settings', 'tabUiTranslations')}`;
        return;
      }
      if (tab === 'arabicLocale') {
        this.breadcrumb = `${settingsTitle} / ${this.ui.screenText('settings', 'tabArabicLocalePick')}`;
        return;
      }
      this.breadcrumb = `/ ${settingsTitle}`;
      return;
    }

    this.breadcrumb = `/ ${home}`;
  }

  currentUserLabel(): string {
    const u = this.auth.currentUser();
    if (!u) {
      return '';
    }
    const name = [u.firstName, u.lastName].filter((x) => x?.trim()).join(' ').trim();
    return name || u.userName;
  }

  toggleDbPanel(event: Event): void {
    event.stopPropagation();
    this.dbPanelOpen = !this.dbPanelOpen;
    if (this.dbPanelOpen) {
      this.closeFloatingPanels(['dbPanel']);
    }
    this.cdr.markForCheck();
  }

  private closeFloatingPanels(except: Array<'calculator' | 'shortcuts' | 'notifications' | 'accountHub' | 'roomStatus' | 'dbPanel'>): void {
    this.langPickerOpen = false;
    if (!except.includes('calculator')) {
      this.calculatorOpen = false;
    }
    if (!except.includes('shortcuts')) {
      this.shortcutsOpen = false;
    }
    if (!except.includes('notifications')) {
      this.notificationsOpen = false;
    }
    if (!except.includes('accountHub')) {
      this.accountHubOpen = false;
    }
    if (!except.includes('roomStatus')) {
      this.roomStatusOpen = false;
    }
    if (!except.includes('dbPanel')) {
      this.dbPanelOpen = false;
    }
  }

  closeDbPanel(): void {
    if (this.dbPanelOpen) {
      this.dbPanelOpen = false;
      this.cdr.markForCheck();
    }
  }

  userInitial(): string {
    const label = this.currentUserLabel().trim();
    return label ? label.charAt(0) : 'م';
  }
}
