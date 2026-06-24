import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HotelAuthService } from '../services/hotel-auth.service';
import { normalizeLandingPagePath } from '../utils/landing-page-path.util';
import { HotelSystemSettingsLoader } from '../services/hotel-system-settings.loader';
import { UiTranslationsService } from '../services/ui-translations.service';
import { UiInlineTextComponent } from '../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../utils/ui-screen-i18n.helper';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly auth = inject(HotelAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly hotelSystemSettings = inject(HotelSystemSettingsLoader);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  userName = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  submitting = false;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.hotelSystemSettings.load().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }

  submit(): void {
    if (this.submitting) {
      return;
    }
    this.errorMessage = '';
    const userName = this.userName.trim();
    const password = this.password;
    if (!userName || !password) {
      this.errorMessage = this.ui.screenText('settings', 'loginMissingFields');
      this.cdr.markForCheck();
      return;
    }

    this.submitting = true;
    this.auth.login(userName, password).subscribe({
      next: (result) => {
        this.submitting = false;
        if (result.success) {
          const rawTarget = this.auth.canNavigateApp()
            ? this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard'
            : this.auth.lockedHomePath();
          const target = normalizeLandingPagePath(rawTarget);
          void this.router.navigateByUrl(this.router.parseUrl(target)).then((ok) => {
            if (!ok) {
              void this.router.navigateByUrl('/dashboard');
            }
          });
          return;
        }
        this.errorMessage =
          result.message?.trim() || this.ui.screenText('settings', 'wrongPassword');
        this.cdr.markForCheck();
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = this.ui.screenText('settings', 'loginFailed');
        this.cdr.markForCheck();
      },
    });
  }
}
