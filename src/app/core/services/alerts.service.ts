import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

export type AlertType = 'success' | 'error' | 'warning' | 'info';
export type ConfirmType = 'warning' | 'danger' | 'info' | 'success';

export interface AlertState {
  show: boolean;
  type: AlertType;
  title: string;
  message: string;
  dismissible: boolean;
}

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
}

export interface ConfirmState {
  show: boolean;
  type: ConfirmType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

export interface MessageDialogOptions {
  title?: string;
  message?: string;
  buttonText?: string;
  type?: AlertType;
}

export interface MessageDialogState {
  show: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttonText: string;
}

const EMPTY_ALERT_STATE: AlertState = {
  show: false,
  type: 'info',
  title: '',
  message: '',
  dismissible: true
};

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  private alertStateSubject = new BehaviorSubject<AlertState>(EMPTY_ALERT_STATE);
  private confirmStateSubject = new BehaviorSubject<ConfirmState | null>(null);
  private messageDialogStateSubject = new BehaviorSubject<MessageDialogState | null>(null);

  private confirmResponseSubject?: Subject<boolean>;
  private messageDialogResponseSubject?: Subject<void>;
  private alertTimeoutId: any = null;

  alertState$ = this.alertStateSubject.asObservable();
  confirmState$ = this.confirmStateSubject.asObservable();
  messageDialogState$ = this.messageDialogStateSubject.asObservable();

  success(message: string, title = 'Success'): void {
    this.showAlert('success', message, title);
  }

  error(message: string, title = 'Error'): void {
    this.showAlert('error', message, title);
  }

  warning(message: string, title = 'Warning'): void {
    this.showAlert('warning', message, title);
  }

  info(message: string, title = 'Information'): void {
    this.showAlert('info', message, title);
  }

  showAlert(
    type: AlertType,
    message: string,
    title = '',
    dismissible = true,
    duration = 4500
  ): void {
    if (this.alertTimeoutId) {
      clearTimeout(this.alertTimeoutId);
      this.alertTimeoutId = null;
    }

    this.alertStateSubject.next({
      show: true,
      type,
      title,
      message,
      dismissible
    });

    if (duration > 0) {
      this.alertTimeoutId = setTimeout(() => {
        this.clearAlert();
      }, duration);
    }
  }

  clearAlert(): void {
    if (this.alertTimeoutId) {
      clearTimeout(this.alertTimeoutId);
      this.alertTimeoutId = null;
    }

    this.alertStateSubject.next(EMPTY_ALERT_STATE);
  }

  confirm(options: ConfirmOptions): Observable<boolean> {
    this.confirmResponseSubject = new Subject<boolean>();

    this.confirmStateSubject.next({
      show: true,
      type: options.type || 'warning',
      title: options.title || 'Are you sure?',
      message: options.message || 'Please confirm this action.',
      confirmText: options.confirmText || 'Yes',
      cancelText: options.cancelText || 'Cancel'
    });

    return this.confirmResponseSubject.asObservable();
  }

  acceptConfirm(): void {
    this.confirmResponseSubject?.next(true);
    this.confirmResponseSubject?.complete();
    this.closeConfirm();
  }

  rejectConfirm(): void {
    this.confirmResponseSubject?.next(false);
    this.confirmResponseSubject?.complete();
    this.closeConfirm();
  }

  closeConfirm(): void {
    this.confirmStateSubject.next(null);
    this.confirmResponseSubject = undefined;
  }

  messageDialog(options: MessageDialogOptions): Observable<void> {
    this.messageDialogResponseSubject = new Subject<void>();

    this.messageDialogStateSubject.next({
      show: true,
      type: options.type || 'info',
      title: options.title || 'Message',
      message: options.message || '',
      buttonText: options.buttonText || 'OK'
    });

    return this.messageDialogResponseSubject.asObservable();
  }

  successDialog(message: string, title = 'Success'): Observable<void> {
    return this.messageDialog({
      type: 'success',
      title,
      message,
      buttonText: 'OK'
    });
  }

  errorDialog(message: string, title = 'Error'): Observable<void> {
    return this.messageDialog({
      type: 'error',
      title,
      message,
      buttonText: 'OK'
    });
  }

  warningDialog(message: string, title = 'Warning'): Observable<void> {
    return this.messageDialog({
      type: 'warning',
      title,
      message,
      buttonText: 'OK'
    });
  }

  infoDialog(message: string, title = 'Information'): Observable<void> {
    return this.messageDialog({
      type: 'info',
      title,
      message,
      buttonText: 'OK'
    });
  }

  closeMessageDialog(): void {
    this.messageDialogResponseSubject?.next();
    this.messageDialogResponseSubject?.complete();

    this.messageDialogStateSubject.next(null);
    this.messageDialogResponseSubject = undefined;
  }
}
