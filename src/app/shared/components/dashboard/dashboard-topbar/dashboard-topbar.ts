import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardUserInfo} from '../../models/dashboard-ui.model';

@Component({
  selector: 'app-dashboard-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-topbar.html',
  styleUrls: ['./dashboard-topbar.scss']
})
export class DashboardTopbar {
  @Input({required: true}) pageLabel = 'Dashboard';
  @Input({required: true}) title = 'Welcome back';
  @Input() subtitle = '';
  @Input() userInfo!: DashboardUserInfo;

  @Input() theme: 'admin' | 'agent' | 'team' = 'admin';

  @Input() showRefresh = false;
  @Input() showPipeline = false;
  @Input() isPipelineRunning = false;

  @Output() refreshClick = new EventEmitter<void>();
  @Output() pipelineClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  onRefresh(): void {
    this.refreshClick.emit();
  }

  onPipeline(): void {
    this.pipelineClick.emit();
  }

  onLogout(): void {
    this.logoutClick.emit();
  }
}
