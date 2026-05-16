import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
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
export class DataTablePanel implements OnChanges {
  @Input() title = '';
  @Input() subtitle = '';

  @Input({required: true}) columns: DashboardTableColumn[] = [];
  @Input({required: true}) rows: any[] = [];

  @Input() actions: DashboardTableAction[] = [];
  @Input() emptyMessage = 'No records found.';

  /**
   * Pagination
   */
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  /**
   * Table scroll
   */
  @Input() maxTableHeight = '430px';

  @Output() actionClick = new EventEmitter<{
    action: string;
    row: any;
  }>();

  currentPage = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows']) {
      this.currentPage = 1;
    }

    if (changes['pageSize']) {
      this.currentPage = 1;
    }
  }

  get totalRows(): number {
    return this.rows?.length || 0;
  }

  get totalPages(): number {
    if (!this.totalRows || !this.pageSize) {
      return 1;
    }

    return Math.ceil(this.totalRows / this.pageSize);
  }

  get startIndex(): number {
    if (!this.totalRows) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.totalRows);
  }

  get visibleRows(): any[] {
    return this.rows.slice(this.startIndex, this.endIndex);
  }

  get showingFrom(): number {
    return this.totalRows === 0 ? 0 : this.startIndex + 1;
  }

  get showingTo(): number {
    return this.endIndex;
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  onPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);

    this.pageSize = value;
    this.currentPage = 1;
  }

  goToFirstPage(): void {
    this.currentPage = 1;
  }

  goToPreviousPage(): void {
    if (this.canGoPrevious) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.canGoNext) {
      this.currentPage++;
    }
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
  }

  onAction(action: DashboardTableAction, row: any): void {
    this.actionClick.emit({
      action: action.action,
      row
    });
  }

  getValue(row: any, columnOrKey: DashboardTableColumn | string): any {
    if (!row || !columnOrKey) {
      return '-';
    }

    const keys =
      typeof columnOrKey === 'string'
        ? [columnOrKey]
        : [columnOrKey.key, ...(columnOrKey.fallbackKeys || [])];

    for (const key of keys) {
      const value = key.split('.').reduce((obj, part) => {
        return obj ? obj[part] : undefined;
      }, row);

      if (Array.isArray(value)) {
        return value.join(', ');
      }

      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }

    return '-';
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
      normalized.includes('success') ||
      normalized.includes('low')
    ) {
      return 'success';
    }

    if (
      normalized.includes('new') ||
      normalized.includes('open') ||
      normalized.includes('medium') ||
      normalized.includes('pending') ||
      normalized.includes('in_progress') ||
      normalized.includes('quotation')
    ) {
      return 'warning';
    }

    if (
      normalized.includes('cancel') ||
      normalized.includes('inactive') ||
      normalized.includes('high') ||
      normalized.includes('critical') ||
      normalized.includes('failed')
    ) {
      return 'danger';
    }

    return 'default';
  }

  trackByIndex(index: number): number {
    return index;
  }
}
