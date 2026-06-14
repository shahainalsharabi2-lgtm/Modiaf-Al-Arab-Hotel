import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../ui-inline-text/ui-inline-text.component';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { fromEvent } from 'rxjs';
import {
  SystemNotificationsService,
  type SystemNotification,
  type SystemNotificationKind,
} from '../../services/system-notifications.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';

type NotificationFilter = 'all' | 'unread';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, UiInlineTextComponent],
  templateUrl: './app-notifications-panel.component.html',
  styleUrls: ['./app-notifications-panel.component.css'],
})
export class AppNotificationsPanelComponent {
  readonly ui = inject(UiTranslationsService);
  readonly notifications = inject(SystemNotificationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Output() closed = new EventEmitter<void>();

  filter: NotificationFilter = 'all';

  constructor() {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    fromEvent(window, 'hotelSystemNotificationsChanged')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.requestClose();
    }
  }

  get filteredItems(): SystemNotification[] {
    const items = this.notifications.items();
    if (this.filter === 'unread') {
      return items.filter((item) => !item.read);
    }
    return items;
  }

  setFilter(filter: NotificationFilter): void {
    this.filter = filter;
  }

  requestClose(): void {
    this.closed.emit();
  }

  markAllRead(): void {
    this.notifications.markAllRead();
  }

  panelIcon(kind: SystemNotificationKind): string {
    if (kind.startsWith('room_')) {
      return 'fa-bed';
    }
    return 'fa-calendar-check';
  }

  metaLine(item: SystemNotification): string {
    const category = this.notifications.categoryLabel(item.kind);
    const time = this.notifications.timeLabelPanel(item);
    return `${category} · ${time}`;
  }
}
