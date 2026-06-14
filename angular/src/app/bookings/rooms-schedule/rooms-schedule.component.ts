import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  ROOMS_SCHEDULE_DEFAULT_ANCHOR,
  ROOMS_SCHEDULE_GROUPS,
  ROOMS_SCHEDULE_LEGEND,
  ROOMS_SCHEDULE_SAMPLE_BARS,
  buildScheduleDays,
  viewModeDayCount,
  type RoomsScheduleBookingBar,
  type RoomsScheduleDay,
  type RoomsScheduleLegendItem,
  type RoomsScheduleRoom,
  type RoomsScheduleRoomGroup,
  type RoomsScheduleViewBy,
  type RoomsScheduleViewMode,
} from './rooms-schedule.static-data';

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-rooms-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UiInlineTextComponent, LocaleNumberPipe],
  templateUrl: './rooms-schedule.component.html',
  styleUrls: ['./rooms-schedule.component.css'],
})
export class RoomsScheduleComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly legend = ROOMS_SCHEDULE_LEGEND;
  readonly groups = ROOMS_SCHEDULE_GROUPS;
  readonly viewModes: RoomsScheduleViewMode[] = ['day', 'week', '14days', 'month'];

  viewMode: RoomsScheduleViewMode = '14days';
  viewBy: RoomsScheduleViewBy = 'roomType';
  anchorDate = ROOMS_SCHEDULE_DEFAULT_ANCHOR;
  days: RoomsScheduleDay[] = [];
  collapsedGroups = new Set<string>();
  searchTerm = '';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rebuildDays();
  }

  label(key: string): string {
    return this.ui.screenText('roomsSchedule', key);
  }

  viewModeLabel(mode: RoomsScheduleViewMode): string {
    const keys: Record<RoomsScheduleViewMode, string> = {
      day: 'viewDay',
      week: 'viewWeek',
      '14days': 'view14days',
      month: 'viewMonth',
    };
    return this.label(keys[mode]);
  }

  get todayDayIndex(): number {
    return this.days.findIndex((d) => d.isToday);
  }

  monthLabel(): string {
    const d = new Date(`${this.anchorDate}T12:00:00`);
    const loc = this.ui.displayLocale() === 'ar' ? 'ar-SA' : undefined;
    return d.toLocaleDateString(loc, { month: 'long', year: 'numeric' });
  }

  get visibleGroups(): RoomsScheduleRoomGroup[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) {
      return [...this.groups];
    }
    return this.groups
      .map((g) => ({
        ...g,
        rooms: g.rooms.filter((r) => r.number.includes(q) || this.label(g.labelKey).toLowerCase().includes(q)),
      }))
      .filter((g) => g.rooms.length > 0);
  }

  barsForRoom(roomId: string): RoomsScheduleBookingBar[] {
    return ROOMS_SCHEDULE_SAMPLE_BARS.filter((b) => b.roomId === roomId);
  }

  barStyle(bar: RoomsScheduleBookingBar): Record<string, string> {
    const item = this.legend.find((l) => l.status === bar.status);
    const color = item?.color ?? '#90a4ae';
    const n = Math.max(1, this.days.length);
    const cellPct = 100 / n;
    return {
      'background-color': color,
      insetInlineStart: `calc(${bar.startDayIndex * cellPct}% + 2px)`,
      width: `calc(${bar.span * cellPct}% - 4px)`,
    };
  }

  todayLineStyle(): Record<string, string> | null {
    const idx = this.todayDayIndex;
    if (idx < 0) {
      return null;
    }
    const n = Math.max(1, this.days.length);
    const pct = ((idx + 0.5) / n) * 100;
    return { insetInlineStart: `${pct}%` };
  }

  legendDot(item: RoomsScheduleLegendItem): Record<string, string> {
    return { 'background-color': item.color };
  }

  isGroupCollapsed(groupId: string): boolean {
    return this.collapsedGroups.has(groupId);
  }

  toggleGroup(groupId: string): void {
    if (this.collapsedGroups.has(groupId)) {
      this.collapsedGroups.delete(groupId);
    } else {
      this.collapsedGroups.add(groupId);
    }
  }

  setViewMode(mode: RoomsScheduleViewMode): void {
    this.viewMode = mode;
    this.rebuildDays();
  }

  goToday(): void {
    this.anchorDate = this.todayIso();
    this.rebuildDays();
  }

  shiftRange(delta: number): void {
    const step = viewModeDayCount(this.viewMode);
    this.anchorDate = addDays(this.anchorDate, delta * step);
    this.rebuildDays();
  }

  trackByDay(_i: number, day: RoomsScheduleDay): string {
    return day.iso;
  }

  trackByRoom(_i: number, room: RoomsScheduleRoom): string {
    return room.id;
  }

  trackByGroup(_i: number, group: RoomsScheduleRoomGroup): string {
    return group.id;
  }

  trackByLegend(_i: number, item: RoomsScheduleLegendItem): string {
    return item.status;
  }

  private rebuildDays(): void {
    this.days = buildScheduleDays(this.anchorDate, viewModeDayCount(this.viewMode), this.todayIso());
    this.cdr.markForCheck();
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
