import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {forkJoin} from 'rxjs';
import {EChartsCoreOption} from 'echarts/core';

import {DashboardService} from '../../../../core/services/dashboard.service';
import {AuthService} from '../../../../core/services/auth.service';
import {AppPermission, AppPermissions} from '../../../../core/permissions/app-permissions';

import {SummaryCard} from '../../../../shared/components/dashboard/summary-card/summary-card';
import {DashboardSidebar} from '../../../../shared/components/dashboard/dashboard-sidebar/dashboard-sidebar';
import {DashboardTopbar} from '../../../../shared/components/dashboard/dashboard-topbar/dashboard-topbar';
import {ChartPanel} from '../../../../shared/components/dashboard/chart-panel/chart-panel';
import {DataTablePanel} from '../../../../shared/components/dashboard/data-table-panel/data-table-panel';

import {
  DashboardSummaryCard,
  DashboardTableAction,
  DashboardTableColumn,
  DashboardUserInfo
} from '../../../../shared/components/models/dashboard-ui.model';
import {LeadFormModal} from '../../../../shared/components/business/lead-form-modal/lead-form-modal';
import {AlertsContainer} from '../../../../shared/components/ui/alerts-container/alerts-container';
import {AlertsService} from '../../../../core/services/alerts.service';

interface LoggedUser {
  id?: number;
  username?: string;
  nickname?: string;
  email?: string;
  roles?: string[];
  supervisorId?: number;
  supervisorUsername?: string;
}

type IcSection =
  | 'overview'
  | 'leads'
  | 'performance'
  | 'recommendations';

interface MenuItem {
  key: IcSection;
  label: string;
  icon: string;
  permission: AppPermission;
}

@Component({
  selector: 'app-ic-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SummaryCard,
    DashboardSidebar,
    DashboardTopbar,
    ChartPanel,
    DataTablePanel,
    LeadFormModal,
    AlertsContainer
  ],
  templateUrl: './ic-dashboard.html',
  styleUrls: ['./ic-dashboard.scss'],
})
export class IcDashboard implements OnInit {

  isLeadModalOpen = false;
  selectedLeadForEdit: any | null = null;

  readonly permissions = AppPermissions;

  activeSection: IcSection = 'overview';

  loggedUser: LoggedUser | null = null;

  isLoading = false;
  errorMessage = '';

  users: any[] = [];
  leads: any[] = [];
  performanceRecords: any[] = [];
  aiPredictions: any[] = [];
  recommendations: any[] = [];

  myLeads: any[] = [];
  myPerformance: any[] = [];
  myPredictions: any[] = [];
  myRecommendations: any[] = [];

  leadStatusChartOption: EChartsCoreOption = {};
  performanceChartOption: EChartsCoreOption = {};
  predictionChartOption: EChartsCoreOption = {};

  summaryCards: DashboardSummaryCard[] = [];

  menuItems: MenuItem[] = [
    {
      key: 'overview',
      label: 'My Overview',
      icon: '📊',
      permission: AppPermissions.DASHBOARD_AGENT_VIEW
    },
    {
      key: 'leads',
      label: 'My Leads',
      icon: '📋',
      permission: AppPermissions.LEAD_VIEW
    },
    {
      key: 'performance',
      label: 'My Performance',
      icon: '🏆',
      permission: AppPermissions.DASHBOARD_AGENT_VIEW
    },
    {
      key: 'recommendations',
      label: 'My Recommendations',
      icon: '💡',
      permission: AppPermissions.RECOMMENDATION_VIEW
    }
  ];

  leadColumns: DashboardTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'customerName', label: 'Customer', fallbackKeys: ['name', 'fullName', 'clientName', 'customerFullName']},
    {key: 'mobile', label: 'Mobile', fallbackKeys: ['phone', 'contactNumber', 'customerMobile', 'mobileNumber']},
    {key: 'status', label: 'Status', type: 'badge'},
    {
      key: 'expectedPremium',
      label: 'Premium',
      type: 'number',
      fallbackKeys: ['premium', 'totalPremium', 'annualPremium', 'monthlyPremium']
    }
  ];

  performanceColumns: DashboardTableColumn[] = [
    {key: 'performanceYear', label: 'Year', type: 'number'},
    {key: 'performanceMonth', label: 'Month', type: 'number'},
    {key: 'totalLeads', label: 'Leads', type: 'number'},
    {key: 'convertedLeads', label: 'Converted', type: 'number'},
    {key: 'totalPremium', label: 'Premium', type: 'number'},
    {key: 'conversionRate', label: 'Conversion %', type: 'number'},
    {key: 'performanceScore', label: 'Score', type: 'number'}
  ];

  recommendationColumns: DashboardTableColumn[] = [
    {key: 'title', label: 'Title'},
    {key: 'recommendationType', label: 'Type'},
    {key: 'priority', label: 'Priority', type: 'badge'},
    {key: 'recommendationText', label: 'Recommendation'}
  ];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private alerts: AlertsService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.activeSection = 'overview';

    this.setDefaultSectionByPermission();
    this.initializeSummaryCards();
    this.buildCharts();

    this.cdr.detectChanges();

    setTimeout(() => {
      this.loadLoggedUser();
    }, 0);
  }

  get sidebarUserInfo(): DashboardUserInfo {
    return {
      username: this.loggedUser?.username || 'agent',
      displayName: this.displayName,
      email: this.loggedUser?.email,
      roleLabel: this.roleLabel
    };
  }

  openLeadModal(): void {
    this.selectedLeadForEdit = null;
    this.isLeadModalOpen = true;
  }

  openEditLeadModal(lead: any): void {
    this.selectedLeadForEdit = lead;
    this.isLeadModalOpen = true;
  }

  closeLeadModal(): void {
    this.isLeadModalOpen = false;
    this.selectedLeadForEdit = null;
  }

  createLead(payload: any): void {
    this.dashboardService.createLead(payload).subscribe({
      next: () => {
        this.loadDashboardData(false);

        setTimeout(() => {
          this.alerts.successDialog(
            'Lead has been saved successfully.',
            'Lead Saved'
          );
        }, 150);
      },
      error: (error) => {
        console.error('Lead create failed', error);

        this.alerts.errorDialog(
          'Lead save failed. Please check the entered details and try again.',
          'Lead Save Failed'
        );
      }
    });
  }

  updateLead(event: { id: number; payload: any }): void {
    this.dashboardService.updateLead(event.id, event.payload).subscribe({
      next: () => {
        this.loadDashboardData(false);

        setTimeout(() => {
          this.alerts.successDialog(
            'Lead has been updated successfully.',
            'Lead Updated'
          );
        }, 150);
      },
      error: (error) => {
        console.error('Lead update failed', error);

        this.alerts.errorDialog(
          'Lead update failed. Please check the entered details and try again.',
          'Lead Update Failed'
        );
      }
    });
  }

  get displayName(): string {
    return this.loggedUser?.nickname || this.loggedUser?.username || 'Insurance Consultant';
  }

  get roleLabel(): string {
    return this.loggedUser?.roles?.join(', ') || 'IC';
  }

  can(permission: AppPermission): boolean {
    return this.authService.hasPermission(permission);
  }

  getVisibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => this.can(item.permission));
  }

  setActiveSection(section: IcSection): void {
    const selectedItem = this.menuItems.find(item => item.key === section);

    if (selectedItem && this.can(selectedItem.permission)) {
      this.activeSection = section;

      this.cdr.detectChanges();

      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }

  loadDashboardData(showLoader: boolean = true): void {
    if (showLoader) {
      this.isLoading = true;
    }

    this.errorMessage = '';
    this.cdr.detectChanges();

    forkJoin({
      users: this.dashboardService.getUsers(),
      leads: this.dashboardService.getLeads(),
      performance: this.dashboardService.getAgentPerformanceByMonth(2026, 5),
      predictions: this.dashboardService.getAiPredictionsByMonth(2026, 6),
      recommendations: this.dashboardService.getRecommendations()
    }).subscribe({
      next: (response) => {
        this.users = response.users || [];
        this.leads = response.leads || [];
        this.performanceRecords = response.performance || [];
        this.aiPredictions = response.predictions || [];
        this.recommendations = response.recommendations || [];

        this.applyIcFilters();
        this.updateSummaryCards();
        this.buildCharts();

        this.isLoading = false;

        this.cdr.detectChanges();

        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      },
      error: (error) => {
        console.error('IC dashboard load failed', error);

        this.errorMessage = 'Dashboard data load failed. Please check backend API, CORS, and Spring Boot server.';
        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });
  }

  getLeadActions(): DashboardTableAction[] {
    const actions: DashboardTableAction[] = [];

    if (this.can(this.permissions.LEAD_VIEW)) {
      actions.push({
        label: 'View',
        icon: '👁️',
        tone: 'primary',
        action: 'view'
      });
    }

    if (this.can(this.permissions.LEAD_UPDATE)) {
      actions.push({
        label: 'Edit',
        icon: '✏️',
        tone: 'primary',
        action: 'edit'
      });
    }

    return actions;
  }

  onLeadAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.openEditLeadModal(event.row);
      return;
    }

    if (event.action === 'view') {
      this.openEditLeadModal(event.row);
      return;
    }

    console.log('IC Lead action:', event.action, event.row);
  }

  getLatestPerformance(): any | null {
    if (!this.myPerformance.length) {
      return null;
    }

    return [...this.myPerformance].sort((a, b) => {
      const av = Number(a.performanceYear || 0) * 100 + Number(a.performanceMonth || 0);
      const bv = Number(b.performanceYear || 0) * 100 + Number(b.performanceMonth || 0);
      return bv - av;
    })[0];
  }

  getLatestPrediction(): any | null {
    if (!this.myPredictions.length) {
      return null;
    }

    return [...this.myPredictions].sort((a, b) => {
      const av = Number(a.predictionYear || 0) * 100 + Number(a.predictionMonth || 0);
      const bv = Number(b.predictionYear || 0) * 100 + Number(b.predictionMonth || 0);
      return bv - av;
    })[0];
  }

  getLatestPerformanceScore(): number {
    return Number(this.getLatestPerformance()?.performanceScore || 0);
  }

  getActiveLeadCount(): number {
    return this.myLeads.filter(lead => {
      const status = lead.status;
      return status === 'NEW' || status === 'IN_PROGRESS' || status === 'QUOTATION_SUBMITTED';
    }).length;
  }

  getConvertedLeadCount(): number {
    return this.myLeads.filter(lead => {
      const status = lead.status;
      return status === 'CONVERTED' || status === 'COMPLETED';
    }).length;
  }

  getCancelledLeadCount(): number {
    return this.myLeads.filter(lead => lead.status === 'CANCELLED').length;
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/';
  }

  private setDefaultSectionByPermission(): void {
    const visibleItems = this.getVisibleMenuItems();

    if (!visibleItems.length) {
      return;
    }

    const currentSectionVisible = visibleItems.some(item => item.key === this.activeSection);

    if (!currentSectionVisible) {
      this.activeSection = visibleItems[0].key;
    }
  }

  private loadLoggedUser(): void {
    const storedUser = this.authService.getCurrentUser();
    const roles = this.authService.getRoles();
    const username = storedUser?.username || this.authService.getCurrentUsername();

    console.log('Stored user from auth service:', storedUser);
    console.log('Username from auth service:', username);
    console.log('Roles from auth service:', roles);

    if (!username) {
      this.loggedUser = {
        username: 'agent',
        nickname: 'Insurance Consultant',
        email: '',
        roles: roles.length ? roles : ['IC']
      };

      this.alerts.errorDialog(
        'Logged user username is missing. Please login again.',
        'User Details Missing'
      );

      this.cdr.detectChanges();
      return;
    }

    this.loggedUser = {
      ...storedUser,
      username,
      roles: storedUser?.roles || roles
    };

    this.cdr.detectChanges();

    this.dashboardService.getUserByUsername(username).subscribe({
      next: (response) => {
        const user = response?.data || response;

        this.loggedUser = {
          ...this.loggedUser,
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          roles: user.roles || this.loggedUser?.roles || roles,
          supervisorId: user.supervisorId,
          supervisorUsername: user.supervisorUsername
        };

        console.log('Final logged user:', this.loggedUser);

        this.cdr.detectChanges();

        setTimeout(() => {
          this.loadDashboardData();
        }, 0);
      },
      error: (error) => {
        console.error('Logged user fetch failed', error);

        this.alerts.errorDialog(
          'Logged user details could not be loaded. Please login again.',
          'User Details Missing'
        );

        this.cdr.detectChanges();
      }
    });
  }

  private applyIcFilters(): void {
    const userId = this.loggedUser?.id;
    const username = this.loggedUser?.username;

    this.myLeads = this.leads.filter(lead => {
      return (
        this.sameId(lead.assignedUserId, userId) ||
        this.sameId(lead.agentId, userId) ||
        this.sameId(lead.userId, userId) ||
        this.sameText(lead.assignedUsername, username) ||
        this.sameText(lead.username, username) ||
        this.sameText(lead.agentUsername, username)
      );
    });

    this.myPerformance = this.performanceRecords.filter(item => {
      return (
        this.sameId(item.agentId, userId) ||
        this.sameId(item.userId, userId) ||
        this.sameText(item.username, username) ||
        this.sameText(item.agentUsername, username)
      );
    });

    this.myPredictions = this.aiPredictions.filter(item => {
      return (
        this.sameId(item.agentId, userId) ||
        this.sameId(item.userId, userId) ||
        this.sameText(item.username, username) ||
        this.sameText(item.agentUsername, username)
      );
    });

    this.myRecommendations = this.recommendations.filter(item => {
      return (
        this.sameId(item.agentId, userId) ||
        this.sameId(item.userId, userId) ||
        this.sameText(item.username, username) ||
        this.sameText(item.agentUsername, username)
      );
    });
  }

  private initializeSummaryCards(): void {
    this.summaryCards = [
      {
        title: 'My Leads',
        value: 0,
        icon: '📋',
        tone: 'blue'
      },
      {
        title: 'Active Leads',
        value: 0,
        icon: '⚡',
        tone: 'green'
      },
      {
        title: 'Converted Leads',
        value: 0,
        icon: '✅',
        tone: 'purple'
      },
      {
        title: 'Recommendations',
        value: 0,
        icon: '💡',
        tone: 'orange'
      }
    ];
  }

  private updateSummaryCards(): void {
    this.summaryCards = [
      {
        title: 'My Leads',
        value: this.myLeads.length,
        icon: '📋',
        tone: 'blue'
      },
      {
        title: 'Active Leads',
        value: this.getActiveLeadCount(),
        icon: '⚡',
        tone: 'green'
      },
      {
        title: 'Converted Leads',
        value: this.getConvertedLeadCount(),
        icon: '✅',
        tone: 'purple'
      },
      {
        title: 'Recommendations',
        value: this.myRecommendations.length,
        icon: '💡',
        tone: 'orange'
      }
    ];
  }

  private buildCharts(): void {
    this.buildLeadStatusChart();
    this.buildPerformanceChart();
    this.buildPredictionChart();
  }

  private buildLeadStatusChart(): void {
    const statuses = this.getUniqueValues(this.myLeads, 'status');

    const data = statuses.map(status => ({
      name: status,
      value: this.myLeads.filter(lead => lead.status === status).length
    }));

    this.leadStatusChartOption = {
      title: {text: 'My Lead Status', left: 'center'},
      tooltip: {trigger: 'item'},
      legend: {bottom: 0},
      series: [
        {
          name: 'Leads',
          type: 'pie',
          radius: ['45%', '70%'],
          data
        }
      ]
    };
  }

  private buildPerformanceChart(): void {
    const sortedPerformance = [...this.myPerformance]
      .sort((a, b) => {
        const ay = Number(a.performanceYear || 0);
        const by = Number(b.performanceYear || 0);
        const am = Number(a.performanceMonth || 0);
        const bm = Number(b.performanceMonth || 0);

        if (ay === by) {
          return am - bm;
        }

        return ay - by;
      })
      .slice(-8);

    this.performanceChartOption = {
      title: {text: 'My Performance Trend', left: 'center'},
      tooltip: {trigger: 'axis'},
      grid: {left: 42, right: 24, top: 62, bottom: 44},
      xAxis: {
        type: 'category',
        data: sortedPerformance.map(item =>
          `${item.performanceYear || ''}-${String(item.performanceMonth || '').padStart(2, '0')}`
        )
      },
      yAxis: {
        type: 'value',
        max: 100
      },
      series: [
        {
          name: 'Performance Score',
          type: 'line',
          data: sortedPerformance.map(item => Number(item.performanceScore || 0))
        }
      ]
    };
  }

  private buildPredictionChart(): void {
    const latestPrediction = this.getLatestPrediction();

    this.predictionChartOption = {
      title: {text: 'Next Month Prediction', left: 'center'},
      tooltip: {trigger: 'axis'},
      grid: {left: 42, right: 24, top: 62, bottom: 44},
      xAxis: {
        type: 'category',
        data: ['Current Score', 'Predicted Score']
      },
      yAxis: {
        type: 'value',
        max: 100
      },
      series: [
        {
          name: 'Score',
          type: 'bar',
          data: [
            this.getLatestPerformanceScore(),
            Number(latestPrediction?.predictedPerformanceScore || 0)
          ]
        }
      ]
    };
  }

  private sameId(value: any, expected: any): boolean {
    if (value === undefined || value === null || expected === undefined || expected === null) {
      return false;
    }

    return Number(value) === Number(expected);
  }

  private sameText(value: any, expected: any): boolean {
    if (!value || !expected) {
      return false;
    }

    return String(value).toLowerCase() === String(expected).toLowerCase();
  }

  private getUniqueValues(items: any[], fieldName: string): string[] {
    const values = items
      .map(item => item[fieldName])
      .filter(value => !!value);

    return [...new Set(values)];
  }
}
