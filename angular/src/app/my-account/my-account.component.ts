import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { HotelAppUserDto, HotelAppUserService } from '../services/hotel-app-user.service';
import { HotelAuthService } from '../services/hotel-auth.service';
import { UiMessageService } from '../services/ui-message.service';
import { UiTranslationsService } from '../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../utils/ui-screen-i18n.helper';
import { HOTEL_USER_ROLE_OPTIONS, normalizeHotelUserRole } from '../utils/hotel-user-role';
import {
  UI_LOCALE_PICKER_OPTIONS,
  type UiLocalePickerCode,
  type UiLocalePickerOption,
} from '../utils/ui-locale-picker.util';
import { formatLocalePickerLabel } from '../utils/locale-picker-label';
import { ArabicCategoryPickerService } from '../services/arabic-category-picker.service';
import { ArabicPreferenceCategoryService } from '../services/arabic-preference-category.service';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css'],
})
export class MyAccountComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly auth = inject(HotelAuthService);
  private readonly userService = inject(HotelAppUserService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly arabicCategoryPicker = inject(ArabicCategoryPickerService);
  private readonly arabicPref = inject(ArabicPreferenceCategoryService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly localeOptions = UI_LOCALE_PICKER_OPTIONS;

  loading = true;
  saving = false;
  profile: HotelAppUserDto | null = null;
  activeSection: 'profile' | 'password' = 'profile';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    const onLocaleChanged = () => this.cdr.markForCheck();
    window.addEventListener('hotelUiLocaleChanged', onLocaleChanged);
    this.destroyRef.onDestroy(() => window.removeEventListener('hotelUiLocaleChanged', onLocaleChanged));

    const session = this.auth.currentUser();
    if (!session?.id) {
      this.loading = false;
      return;
    }
    this.userService.get(session.id).subscribe({
      next: (user) => {
        this.profile = { ...user };
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.uiMsg.show(this.ui.screenText('myAccount', 'loadFail'));
        this.cdr.markForCheck();
      },
    });
  }

  roleLabel(role: string | null | undefined): string {
    const key = HOTEL_USER_ROLE_OPTIONS.find(
      (o) => o.value === normalizeHotelUserRole(role),
    )?.labelKey;
    return key ? this.ui.screenText('settings', key) : '';
  }

  localeLabel(labelKey: UiLocalePickerOption['labelKey']): string {
    const raw = this.ui.screenText('settings', labelKey);
    return formatLocalePickerLabel(raw, this.ui.displayLocale());
  }

  localeFlag(opt: UiLocalePickerOption): string {
    if (opt.code === 'ar' && this.ui.displayLocale() === 'ar') {
      return this.arabicPref.activeFlagSrc();
    }
    return opt.flagSrc;
  }

  localeShortCode(opt: UiLocalePickerOption): string {
    if (opt.code === 'ar' && this.ui.displayLocale() === 'ar') {
      return this.arabicPref.activeShortCode();
    }
    return opt.shortCode;
  }

  selectDefaultLanguage(code: UiLocalePickerCode): void {
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

  setActiveSection(section: 'profile' | 'password'): void {
    this.activeSection = section;
  }

  initials(): string {
    const first = (this.profile?.firstName ?? '').trim();
    const last = (this.profile?.lastName ?? '').trim();
    return (first.charAt(0) || last.charAt(0) || this.profile?.userName?.charAt(0) || 'H').toUpperCase();
  }

  save(): void {
    if (!this.profile || this.saving) {
      return;
    }
    const lockedRole = normalizeHotelUserRole(
      this.auth.currentUser()?.role ?? this.profile.role,
    );
    const input = {
      firstName: (this.profile.firstName ?? '').trim(),
      lastName: (this.profile.lastName ?? '').trim(),
      userName: (this.profile.userName ?? '').trim(),
      email: (this.profile.email ?? '').trim(),
      phoneNumber: (this.profile.phoneNumber ?? '').trim(),
      password: (this.profile.password ?? '').trim(),
      role: lockedRole,
      allowNavigation: this.auth.currentUser()?.allowNavigation !== false,
      landingPagePath: this.profile?.landingPagePath ?? '/dashboard',
    };
    if (!input.firstName || !input.lastName || !input.userName) {
      this.uiMsg.show(this.ui.screenText('myAccount', 'requiredFields'));
      return;
    }
    if (!this.profile.id) {
      this.auth.updateSession({
        id: 0,
        firstName: input.firstName,
        lastName: input.lastName,
        userName: input.userName,
        email: input.email,
        phoneNumber: input.phoneNumber,
        role: input.role,
        allowNavigation: input.allowNavigation,
        landingPagePath: input.landingPagePath,
      });
      this.uiMsg.show(this.ui.screenText('myAccount', 'saveSuccess'));
      this.cdr.markForCheck();
      return;
    }
    this.saving = true;
    this.userService.getAll().subscribe({
      next: (all) => {
        const duplicate = all.some(
          (u) => u.id !== this.profile!.id && u.userName.toLowerCase() === input.userName.toLowerCase(),
        );
        if (duplicate) {
          this.saving = false;
          this.uiMsg.show(this.ui.screenText('myAccount', 'duplicateUserName'));
          this.cdr.markForCheck();
          return;
        }
        this.userService.update(this.profile!.id, input).subscribe({
          next: () => {
            this.saving = false;
            this.auth.updateSession({
              id: this.profile!.id,
              firstName: input.firstName,
              lastName: input.lastName,
              userName: input.userName,
              email: input.email,
              phoneNumber: input.phoneNumber,
              role: input.role,
              allowNavigation: input.allowNavigation,
              landingPagePath: input.landingPagePath,
            });
            this.uiMsg.show(this.ui.screenText('myAccount', 'saveSuccess'));
            this.cdr.markForCheck();
          },
          error: () => {
            this.saving = false;
            this.uiMsg.show(this.ui.screenText('myAccount', 'saveFail'));
            this.cdr.markForCheck();
          },
        });
      },
      error: () => {
        this.saving = false;
        this.uiMsg.show(this.ui.screenText('myAccount', 'saveFail'));
        this.cdr.markForCheck();
      },
    });
  }

  savePassword(): void {
    if (!this.profile || this.saving) {
      return;
    }
    if (!this.newPassword || !this.confirmPassword) {
      this.uiMsg.show(this.ui.screenText('myAccount', 'passwordRequired'));
      return;
    }
    if (this.profile.password && this.currentPassword && this.currentPassword !== this.profile.password) {
      this.uiMsg.show(this.ui.screenText('myAccount', 'currentPasswordInvalid'));
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.uiMsg.show(this.ui.screenText('myAccount', 'passwordMismatch'));
      return;
    }
    this.profile.password = this.newPassword;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.save();
  }
}
