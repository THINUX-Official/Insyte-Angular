import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardMenuItem, DashboardUserInfo} from '../../models/dashboard-ui.model';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-sidebar.html',
  styleUrls: ['./dashboard-sidebar.scss']
})
export class DashboardSidebar<TSection = string> {
  @Input({required: true}) title = 'Insyte';
  @Input({required: true}) subtitle = 'Dashboard';
  @Input({required: true}) logoText = 'AI';

  @Input({required: true}) menuItems: DashboardMenuItem<TSection>[] = [];
  @Input({required: true}) activeSection!: TSection;
  @Input({required: true}) userInfo!: DashboardUserInfo;

  @Input() theme: 'admin' | 'agent' | 'team' = 'admin';

  @Output() sectionChange = new EventEmitter<TSection>();

  onSectionClick(section: TSection): void {
    this.sectionChange.emit(section);
  }
}
