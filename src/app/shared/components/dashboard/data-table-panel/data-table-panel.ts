import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule, CurrencyPipe, DecimalPipe} from '@angular/common';

import {DashboardTableAction, DashboardTableColumn} from '../../models/dashboard-ui.model';

import {EmptyState} from '../empty-state/empty-state';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-data-table-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe, EmptyState],
  templateUrl: './data-table-panel.html',
  styleUrls: ['./data-table-panel.scss']
})
export class DataTablePanel implements OnChanges {
  @Input() searchable = true;
  @Input() searchPlaceholder = 'Search records...';

  @Input() enableStatusFilter = false;
  @Input() statusFilterKey = 'status';
  @Input() statusFilterLabel = 'Status';

  @Input() enableDateFilter = false;
  @Input() dateFilterKey = 'createdAt';
  @Input() dateFilterLabel = 'Date';

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

  searchText = '';
  selectedStatus = '';
  dateFrom = '';
  dateTo = '';

  currentPage = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows']) {
      this.currentPage = 1;
    }

    if (changes['pageSize']) {
      this.currentPage = 1;
    }
  }

  get filteredRows(): any[] {
    let result = [...(this.rows || [])];

    if (this.searchText.trim()) {
      const search = this.searchText.trim().toLowerCase();

      result = result.filter(row => {
        return this.columns.some(column => {
          const value = this.getValue(row, column);

          return String(value || '')
            .toLowerCase()
            .includes(search);
        });
      });
    }

    if (this.enableStatusFilter && this.selectedStatus) {
      result = result.filter(row => {
        const value = this.getValueByKey(row, this.statusFilterKey);
        return String(value || '') === this.selectedStatus;
      });
    }

    if (this.enableDateFilter && (this.dateFrom || this.dateTo)) {
      result = result.filter(row => {
        const value = this.getValueByKey(row, this.dateFilterKey);

        if (!value) {
          return false;
        }

        const rowDate = new Date(String(value).slice(0, 10));
        const fromDate = this.dateFrom ? new Date(this.dateFrom) : null;
        const toDate = this.dateTo ? new Date(this.dateTo) : null;

        if (fromDate && rowDate < fromDate) {
          return false;
        }

        if (toDate && rowDate > toDate) {
          return false;
        }

        return true;
      });
    }

    return result;
  }

  get statusOptions(): string[] {
    if (!this.enableStatusFilter) {
      return [];
    }

    const values = (this.rows || [])
      .map(row => this.getValueByKey(row, this.statusFilterKey))
      .filter(value => value !== undefined && value !== null && value !== '')
      .map(value => String(value));

    return [...new Set(values)].sort();
  }

  get totalRows(): number {
    return this.filteredRows.length;
  }

  get visibleRows(): any[] {
    return this.filteredRows.slice(this.startIndex, this.endIndex);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  onStatusChange(): void {
    this.currentPage = 1;
  }

  onDateChange(): void {
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 1;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchText.trim() ||
      this.selectedStatus ||
      this.dateFrom ||
      this.dateTo
    );
  }

  getValueByKey(row: any, key: string): any {
    if (!row || !key) {
      return null;
    }

    return key.split('.').reduce((obj, part) => {
      return obj ? obj[part] : undefined;
    }, row);
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
