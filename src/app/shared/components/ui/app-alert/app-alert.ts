import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-alert.html',
  styleUrls: ['./app-alert.scss']
})
export class AppAlert {
  @Input() type: AlertType = 'info';
  @Input() message = '';
  @Input() title = '';
  @Input() show = false;
  @Input() dismissible = true;

  @Output() close = new EventEmitter<void>();

  get icon(): string {
    switch (this.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  }

  get defaultTitle(): string {
    switch (this.type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Information';
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
