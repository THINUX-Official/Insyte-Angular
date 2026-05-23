import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlertsService, AlertState, ConfirmState, MessageDialogState} from '../../../../core/services/alerts.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-alerts-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts-container.html',
  styleUrls: ['./alerts-container.scss']
})
export class AlertsContainer implements OnInit, OnDestroy {
  alert: AlertState = {
    show: false,
    type: 'info',
    title: '',
    message: '',
    dismissible: true
  };

  confirm: ConfirmState | null = null;
  messageDialog: MessageDialogState | null = null;

  private subscriptions = new Subscription();

  constructor(
    private alertsService: AlertsService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.alertsService.alertState$.subscribe(alert => {
        this.alert = alert;
        this.cdr.detectChanges();
      })
    );

    this.subscriptions.add(
      this.alertsService.confirmState$.subscribe(confirm => {
        this.confirm = confirm;
        this.cdr.detectChanges();
      })
    );

    this.subscriptions.add(
      this.alertsService.messageDialogState$.subscribe(messageDialog => {
        this.messageDialog = messageDialog;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get alertIcon(): string {
    switch (this.alert.type) {
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

  get confirmIcon(): string {
    switch (this.confirm?.type) {
      case 'danger':
        return '🗑️';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default:
        return '⚠️';
    }
  }

  get messageDialogIcon(): string {
    switch (this.messageDialog?.type) {
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

  closeAlert(): void {
    this.alertsService.clearAlert();
  }

  confirmYes(): void {
    this.alertsService.acceptConfirm();
  }

  confirmNo(): void {
    this.alertsService.rejectConfirm();
  }

  closeMessageDialog(): void {
    this.alertsService.closeMessageDialog();
  }
}
