import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';

import {DashboardTableAction, DashboardTableColumn} from '../../models/dashboard-ui.model';
import {EmptyState} from '../empty-state/empty-state';

@Component({
  selector: 'app-data-table-panel',
  standalone: true,
  imports: [CommonModule, DecimalPipe, EmptyState],
  templateUrl: './data-table-panel.html',
  styleUrls: ['./data-table-panel.scss']
})
export class DataTablePanel {
  @Input() title = '';
  @Input() subtitle = '';

  @Input({required: true}) columns: DashboardTableColumn[] = [];
  @Input({required: true}) rows: any[] = [];

  @Input() actions: DashboardTableAction[] = [];
  @Input() pageSize = 50;
  @Input() emptyMessage = 'No records found.';

  @Output() actionClick = new EventEmitter<{
    action: string;
    row: any;
  }>();

  get visibleRows(): any[] {
    return this.rows.slice(0, this.pageSize);
  }

  onAction(action: DashboardTableAction, row: any): void {
    this.actionClick.emit({
      action: action.action,
      row
    });
  }

  getValue(row: any, key: string): any {
    if (!row || !key) {
      return '-';
    }

    const value = key.split('.').reduce((obj, part) => {
      return obj ? obj[part] : undefined;
    }, row);

    return value === undefined || value === null || value === '' ? '-' : value;
  }

  getBadgeClass(value: any): string {
    if (!value) {
      return 'default';
    }

    const normalized = String(value).toLowerCase();

    if (
      normalized.includes('active') ||
      normalized.includes('completed') ||
      normalized.includes('converted') ||
      normalized.includes('low')
    ) {
      return 'success';
    }

    if (
      normalized.includes('new') ||
      normalized.includes('open') ||
      normalized.includes('medium') ||
      normalized.includes('in_progress') ||
      normalized.includes('quotation')
    ) {
      return 'warning';
    }

    if (
      normalized.includes('cancel') ||
      normalized.includes('inactive') ||
      normalized.includes('high') ||
      normalized.includes('critical')
    ) {
      return 'danger';
    }

    return 'default';
  }

  trackByIndex(index: number): number {
    return index;
  }
}
