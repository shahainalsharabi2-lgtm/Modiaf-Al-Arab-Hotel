import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UiTranslationsService } from '../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../utils/ui-screen-i18n.helper';
import { ReportsAdvancedCenterComponent } from './reports-advanced-center/reports-advanced-center.component';
import { ReportsTemplateCenterComponent } from './reports-template-center/reports-template-center.component';
import { ReportsManagementCenterComponent } from './reports-management-center/reports-management-center.component';

export type ReportsHubKind = 'advanced' | 'template' | 'management';

type ReportsHubCard = {
  kind: ReportsHubKind;
  titleKey: string;
  descKey: string;
  icon: string;
};

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UiInlineTextComponent,
    ReportsAdvancedCenterComponent,
    ReportsTemplateCenterComponent,
    ReportsManagementCenterComponent,
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  activeHub: ReportsHubKind | null = null;

  readonly hubCards: ReadonlyArray<ReportsHubCard> = [
    {
      kind: 'advanced',
      titleKey: 'hubAdvancedTitle',
      descKey: 'hubAdvancedDesc',
      icon: 'fa-chart-line',
    },
    {
      kind: 'template',
      titleKey: 'hubTemplateTitle',
      descKey: 'hubTemplateDesc',
      icon: 'fa-file-alt',
    },
    {
      kind: 'management',
      titleKey: 'hubManagementTitle',
      descKey: 'hubManagementDesc',
      icon: 'fa-file-alt',
    },
  ];

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const hub = params.get('hub');
      this.activeHub = this.isReportsHubKind(hub) ? hub : null;
      this.cdr.markForCheck();
    });
  }

  hubQuery(kind: ReportsHubKind): Record<string, string> {
    return { hub: kind };
  }

  activeHubCard(): ReportsHubCard | null {
    if (!this.activeHub) {
      return null;
    }
    return this.hubCards.find((card) => card.kind === this.activeHub) ?? null;
  }

  private isReportsHubKind(value: string | null): value is ReportsHubKind {
    return value === 'advanced' || value === 'template' || value === 'management';
  }
}
