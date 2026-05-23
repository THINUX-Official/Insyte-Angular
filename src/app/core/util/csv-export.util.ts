export interface CsvColumn {
  key: string;
  label: string;
  fallbackKeys?: string[];
}

export class CsvExportUtil {

  static exportToCsv(
    fileName: string,
    rows: any[],
    columns: CsvColumn[]
  ): void {
    if (!rows || rows.length === 0) {
      console.warn('No rows available to export.');
      return;
    }

    const safeFileName = this.buildSafeFileName(fileName);
    const header = columns.map(col => this.escapeCsvValue(col.label)).join(',');

    const csvRows = rows.map(row => {
      return columns
        .map(column => {
          const value = this.getCellValue(row, column);
          return this.escapeCsvValue(value);
        })
        .join(',');
    });

    const csvContent = [header, ...csvRows].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${safeFileName}.csv`;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  private static getCellValue(row: any, column: CsvColumn): any {
    if (!row || !column) {
      return '';
    }

    let value = this.getNestedValue(row, column.key);

    if ((value === null || value === undefined || value === '') && column.fallbackKeys?.length) {
      for (const fallbackKey of column.fallbackKeys) {
        const fallbackValue = this.getNestedValue(row, fallbackKey);

        if (fallbackValue !== null && fallbackValue !== undefined && fallbackValue !== '') {
          value = fallbackValue;
          break;
        }
      }
    }

    if (Array.isArray(value)) {
      return value.join(' | ');
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return value ?? '';
  }

  private static getNestedValue(row: any, key: string): any {
    return key.split('.').reduce((obj, part) => {
      return obj ? obj[part] : undefined;
    }, row);
  }

  private static escapeCsvValue(value: any): string {
    const stringValue = String(value ?? '');
    const escapedValue = stringValue.replace(/"/g, '""');

    if (
      escapedValue.includes(',') ||
      escapedValue.includes('"') ||
      escapedValue.includes('\n') ||
      escapedValue.includes('\r')
    ) {
      return `"${escapedValue}"`;
    }

    return escapedValue;
  }

  private static buildSafeFileName(fileName: string): string {
    const date = new Date();

    const datePart = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');

    const safeName = String(fileName || 'report')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${safeName || 'report'}-${datePart}`;
  }
}
