import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  PERMISSION_TREE_SEED,
  PermissionActionSeed,
  PermissionEntitySeed,
  PermissionTreeNodeSeed,
  buildInitialPermissionState,
} from './usr-permissions.seed';

@Component({
  selector: 'app-usr-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './usr-permissions.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    './usr-permissions.component.scss',
  ],
})
export class UsrPermissionsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  readonly tree = PERMISSION_TREE_SEED;

  selectedNodeId = 'settings';
  treeSearch = '';
  entitySearch = '';
  permissionState = buildInitialPermissionState(PERMISSION_TREE_SEED);

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  selectedNode(): PermissionTreeNodeSeed {
    return this.tree.find((node) => node.id === this.selectedNodeId) ?? this.tree[0];
  }

  filteredTreeNodes(): PermissionTreeNodeSeed[] {
    const q = this.treeSearch.trim().toLowerCase();
    if (!q) {
      return this.tree;
    }
    return this.tree.filter((node) => this.ui.screenText('settings', node.labelKey).toLowerCase().includes(q));
  }

  filteredEntities(): PermissionEntitySeed[] {
    const q = this.entitySearch.trim().toLowerCase();
    const entities = this.selectedNode().entities;
    if (!q) {
      return entities;
    }
    return entities.filter((row) => row.name.toLowerCase().includes(q));
  }

  selectNode(nodeId: string): void {
    this.selectedNodeId = nodeId;
    this.entitySearch = '';
    this.cdr.markForCheck();
  }

  actionLabel(action: PermissionActionSeed): string {
    if (action.labelKey) {
      return this.ui.screenText('settings', action.labelKey);
    }
    return action.label ?? action.id;
  }

  isActionChecked(entityId: string, actionId: string): boolean {
    return !!this.permissionState[entityId]?.[actionId];
  }

  toggleAction(entity: PermissionEntitySeed, action: PermissionActionSeed): void {
    if (!this.canEdit) {
      return;
    }
    const current = this.isActionChecked(entity.id, action.id);
    this.permissionState[entity.id] = {
      ...this.permissionState[entity.id],
      [action.id]: !current,
    };
    this.cdr.markForCheck();
  }

  isEntityFullyChecked(entity: PermissionEntitySeed): boolean {
    return entity.actions.every((action) => this.isActionChecked(entity.id, action.id));
  }

  isEntityPartiallyChecked(entity: PermissionEntitySeed): boolean {
    const checked = entity.actions.filter((action) => this.isActionChecked(entity.id, action.id)).length;
    return checked > 0 && checked < entity.actions.length;
  }

  toggleEntity(entity: PermissionEntitySeed): void {
    if (!this.canEdit) {
      return;
    }
    const next = !this.isEntityFullyChecked(entity);
    const nextState = { ...this.permissionState[entity.id] };
    for (const action of entity.actions) {
      nextState[action.id] = next;
    }
    this.permissionState[entity.id] = nextState;
    this.cdr.markForCheck();
  }

  isNodeFullyChecked(node: PermissionTreeNodeSeed): boolean {
    if (!node.entities.length) {
      return false;
    }
    return node.entities.every((entity) => this.isEntityFullyChecked(entity));
  }

  isNodePartiallyChecked(node: PermissionTreeNodeSeed): boolean {
    if (!node.entities.length) {
      return false;
    }
    const fully = node.entities.filter((entity) => this.isEntityFullyChecked(entity)).length;
    return fully > 0 && fully < node.entities.length;
  }

  toggleNode(node: PermissionTreeNodeSeed, event: Event): void {
    event.stopPropagation();
    if (!this.canEdit || !node.entities.length) {
      return;
    }
    const next = !this.isNodeFullyChecked(node);
    for (const entity of node.entities) {
      const nextState = { ...this.permissionState[entity.id] };
      for (const action of entity.actions) {
        nextState[action.id] = next;
      }
      this.permissionState[entity.id] = nextState;
    }
    this.cdr.markForCheck();
  }

  isGrantAllChecked(): boolean {
    const entities = this.selectedNode().entities;
    if (!entities.length) {
      return false;
    }
    return entities.every((entity) => this.isEntityFullyChecked(entity));
  }

  isGrantAllPartial(): boolean {
    const entities = this.selectedNode().entities;
    if (!entities.length) {
      return false;
    }
    const fully = entities.filter((entity) => this.isEntityFullyChecked(entity)).length;
    return fully > 0 && fully < entities.length;
  }

  toggleGrantAll(): void {
    if (!this.canEdit) {
      return;
    }
    const next = !this.isGrantAllChecked();
    for (const entity of this.selectedNode().entities) {
      const nextState = { ...this.permissionState[entity.id] };
      for (const action of entity.actions) {
        nextState[action.id] = next;
      }
      this.permissionState[entity.id] = nextState;
    }
    this.cdr.markForCheck();
  }

  panelTitleKey(): string {
    return this.selectedNode().labelKey;
  }
}
