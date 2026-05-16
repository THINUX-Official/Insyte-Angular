import {Component, OnInit} from '@angular/core';
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

interface LoggedUser {
  id?: number;
  username?: string;
  nickname?: string;
  email?: string;
  roles?: string[];
}

type AdminSection =
  | 'overview'
  | 'users'
  | 'leads'
  | 'ai'
  | 'fraud'
  | 'recommendations'
  | 'experiments';

interface MenuItem {
  key: AdminSection;
  label: string;
  icon: string;
  permission: AppPermission;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SummaryCard,
    DashboardSidebar,
    DashboardTopbar,
    ChartPanel,
    DataTablePanel
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboard implements OnInit {
  readonly permissions = AppPermissions;

  activeSection: AdminSection = 'overview';

  loggedUser: LoggedUser | null = null;

  isLoading = false;
  isPipelineRunning = false;
  errorMessage = '';
  pipelineMessage = '';

  users: any[] = [];
  leads: any[] = [];
  performanceRecords: any[] = [];
  aiPredictions: any[] = [];
  fraudAlerts: any[] = [];
  recommendations: any[] = [];
  mlExperiments: any[] = [];

  roleChartOption: EChartsCoreOption = {};
  leadStatusChartOption: EChartsCoreOption = {};
  performanceChartOption: EChartsCoreOption = {};
  predictionChartOption: EChartsCoreOption = {};
  alertChartOption: EChartsCoreOption = {};

  summaryCards: DashboardSummaryCard[] = [];

  menuItems: MenuItem[] = [
    {
      key: 'overview',
      label: 'Dashboard Overview',
      icon: '📊',
      permission: AppPermissions.DASHBOARD_ADMIN_VIEW
    },
    {
      key: 'users',
      label: 'User Management',
      icon: '👥',
      permission: AppPermissions.USER_VIEW
    },
    {
      key: 'leads',
      label: 'Lead Management',
      icon: '📋',
      permission: AppPermissions.LEAD_VIEW
    },
    {
      key: 'ai',
      label: 'AI Analytics',
      icon: '🤖',
      permission: AppPermissions.AI_ANALYTICS_VIEW
    },
    {
      key: 'fraud',
      label: 'Fraud & Risk',
      icon: '🚨',
      permission: AppPermissions.FRAUD_VIEW
    },
    {
      key: 'recommendations',
      label: 'Recommendations',
      icon: '💡',
      permission: AppPermissions.RECOMMENDATION_VIEW
    },
    {
      key: 'experiments',
      label: 'ML Experiments',
      icon: '🧪',
      permission: AppPermissions.ML_EXPERIMENT_VIEW
    }
  ];

  userColumns: DashboardTableColumn[] = [
    {key: 'username', label: 'Username'},
    {key: 'nickname', label: 'Name'},
    {key: 'email', label: 'Email'},
    {key: 'roles', label: 'Roles'},
    {key: 'status', label: 'Status', type: 'badge'}
  ];

  leadColumns: DashboardTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'customerName', label: 'Customer'},
    {key: 'mobile', label: 'Mobile'},
    {key: 'status', label: 'Status', type: 'badge'},
    {key: 'expectedPremium', label: 'Premium', type: 'number'}
  ];

  performanceColumns: DashboardTableColumn[] = [
    {key: 'username', label: 'Agent'},
    {key: 'totalLeads', label: 'Leads', type: 'number'},
    {key: 'convertedLeads', label: 'Converted', type: 'number'},
    {key: 'totalPremium', label: 'Premium', type: 'number'},
    {key: 'performanceScore', label: 'Score', type: 'number'}
  ];

  recommendationColumns: DashboardTableColumn[] = [
    {key: 'title', label: 'Title'},
    {key: 'recommendationType', label: 'Type'},
    {key: 'priority', label: 'Priority', type: 'badge'},
    {key: 'username', label: 'Agent'},
    {key: 'recommendationText', label: 'Recommendation'}
  ];

  mlExperimentColumns: DashboardTableColumn[] = [
    {key: 'modelName', label: 'Model'},
    {key: 'modelType', label: 'Type'},
    {key: 'algorithm', label: 'Algorithm'},
    {key: 'datasetSize', label: 'Dataset', type: 'number'},
    {key: 'mae', label: 'MAE', type: 'number'},
    {key: 'rmse', label: 'RMSE', type: 'number'},
    {key: 'r2Score', label: 'R²', type: 'number'}
  ];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.loadLoggedUser();
    this.setDefaultSectionByPermission();
    this.loadDashboardData();
  }

  get sidebarUserInfo(): DashboardUserInfo {
    return {
      username: this.loggedUser?.username || 'admin',
      displayName: this.displayName,
      email: this.loggedUser?.email,
      roleLabel: this.roleLabel
    };
  }

  get displayName(): string {
    return this.loggedUser?.nickname || this.loggedUser?.username || 'User';
  }

  get roleLabel(): string {
    return this.loggedUser?.roles?.join(', ') || '-';
  }

  can(permission: AppPermission): boolean {
    return this.authService.hasPermission(permission);
  }

  getVisibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => this.can(item.permission));
  }

  setActiveSection(section: AdminSection): void {
    const selectedItem = this.menuItems.find(item => item.key === section);

    if (selectedItem && this.can(selectedItem.permission)) {
      this.activeSection = section;
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.pipelineMessage = '';

    forkJoin({
      users: this.dashboardService.getUsers(),
      leads: this.dashboardService.getLeads(),
      performance: this.dashboardService.getAgentPerformanceByMonth(2026, 5),
      predictions: this.dashboardService.getAiPredictionsByMonth(2026, 6),
      fraudAlerts: this.dashboardService.getFraudAlerts(),
      recommendations: this.dashboardService.getRecommendations(),
      experiments: this.dashboardService.getMlExperiments()
    }).subscribe({
      next: (response) => {
        this.users = response.users || [];
        this.leads = response.leads || [];
        this.performanceRecords = response.performance || [];
        this.aiPredictions = response.predictions || [];
        this.fraudAlerts = response.fraudAlerts || [];
        this.recommendations = response.recommendations || [];
        this.mlExperiments = response.experiments || [];

        this.updateSummaryCards();
        this.buildCharts();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Dashboard load failed', error);
        this.errorMessage = 'Dashboard data load failed. Please check backend API, CORS, and Spring Boot server.';
        this.isLoading = false;
      }
    });
  }

  runAiPipeline(): void {
    if (!this.can(this.permissions.AI_PIPELINE_RUN)) {
      this.errorMessage = 'You do not have permission to run the AI pipeline.';
      return;
    }

    this.isPipelineRunning = true;
    this.pipelineMessage = '';
    this.errorMessage = '';

    this.dashboardService.runAiPipeline().subscribe({
      next: (response) => {
        this.isPipelineRunning = false;

        if (response?.success) {
          this.pipelineMessage = 'AI pipeline completed successfully.';
          this.loadDashboardData();
        } else {
          this.errorMessage = response?.message || 'AI pipeline failed.';
        }
      },
      error: (error) => {
        console.error('AI pipeline failed', error);
        this.isPipelineRunning = false;
        this.errorMessage = 'AI pipeline API failed. Please check backend.';
      }
    });
  }

  getUserActions(): DashboardTableAction[] {
    const actions: DashboardTableAction[] = [];

    if (this.can(this.permissions.USER_UPDATE)) {
      actions.push({
        label: 'Edit',
        icon: '✏️',
        tone: 'primary',
        action: 'edit'
      });
    }

    if (this.can(this.permissions.USER_DELETE)) {
      actions.push({
        label: 'Delete',
        icon: '🗑️',
        tone: 'danger',
        action: 'delete'
      });
    }

    return actions;
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

    if (this.can(this.permissions.LEAD_DELETE)) {
      actions.push({
        label: 'Delete',
        icon: '🗑️',
        tone: 'danger',
        action: 'delete'
      });
    }

    return actions;
  }

  getFraudActions(): DashboardTableAction[] {
    const actions: DashboardTableAction[] = [];

    if (this.can(this.permissions.FRAUD_REVIEW)) {
      actions.push({
        label: 'Review',
        icon: '👁️',
        tone: 'warning',
        action: 'review'
      });

      actions.push({
        label: 'Resolve',
        icon: '✅',
        tone: 'success',
        action: 'resolve'
      });
    }

    return actions;
  }

  onUserAction(event: { action: string; row: any }): void {
    console.log('User action:', event.action, event.row);
  }

  onLeadAction(event: { action: string; row: any }): void {
    console.log('Lead action:', event.action, event.row);
  }

  onFraudAction(event: { action: string; row: any }): void {
    console.log('Fraud action:', event.action, event.row);
  }

  getTotalAgents(): number {
    return this.users.filter(user => (user.roles || []).includes('IC')).length;
  }

  getActiveLeads(): number {
    return this.leads.filter(lead => {
      const status = lead.status;
      return status === 'NEW' || status === 'IN_PROGRESS' || status === 'QUOTATION_SUBMITTED';
    }).length;
  }

  getCompletedLeads(): number {
    return this.leads.filter(lead => lead.status === 'COMPLETED').length;
  }

  getCancelledLeads(): number {
    return this.leads.filter(lead => lead.status === 'CANCELLED').length;
  }

  getOpenFraudAlertCount(): number {
    return this.fraudAlerts.filter(alert => alert.status === 'OPEN').length;
  }

  getAveragePerformanceScore(): number {
    if (!this.performanceRecords.length) {
      return 0;
    }

    const total = this.performanceRecords.reduce((sum, item) => {
      return sum + Number(item.performanceScore || 0);
    }, 0);

    return total / this.performanceRecords.length;
  }

  getTopPerformers(): any[] {
    return [...this.performanceRecords]
      .sort((a, b) => Number(b.performanceScore || 0) - Number(a.performanceScore || 0))
      .slice(0, 6);
  }

  getLowPerformers(): any[] {
    return [...this.performanceRecords]
      .sort((a, b) => Number(a.performanceScore || 0) - Number(b.performanceScore || 0))
      .slice(0, 6);
  }

  getOpenFraudAlerts(): any[] {
    return this.fraudAlerts
      .filter(item => item.status === 'OPEN')
      .slice(0, 10);
  }

  getLatestRecommendations(): any[] {
    return [...this.recommendations]
      .sort((a, b) => {
        const dateA = new Date(a.generatedAt || '').getTime();
        const dateB = new Date(b.generatedAt || '').getTime();
        return dateB - dateA;
      })
      .slice(0, 10);
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/';
  }

  private setDefaultSectionByPermission(): void {
    const firstVisibleItem = this.getVisibleMenuItems()[0];

    if (firstVisibleItem) {
      this.activeSection = firstVisibleItem.key;
    }
  }

  private loadLoggedUser(): void {
    const storedUser = this.authService.getCurrentUser();
    const roles = this.authService.getRoles();

    if (!storedUser) {
      this.loggedUser = {
        username: 'admin',
        nickname: 'Administrator',
        email: 'admin@gmail.com',
        roles: roles.length ? roles : ['ADMIN']
      };
      return;
    }

    this.loggedUser = {
      ...storedUser,
      roles: storedUser.roles || roles
    };
  }

  private updateSummaryCards(): void {
    this.summaryCards = [
      {
        title: 'Total Users',
        value: this.users.length,
        icon: '👥',
        tone: 'blue'
      },
      {
        title: 'Total Leads',
        value: this.leads.length,
        icon: '📋',
        tone: 'green'
      },
      {
        title: 'AI Predictions',
        value: this.aiPredictions.length,
        icon: '🤖',
        tone: 'purple'
      },
      {
        title: 'Open Fraud Alerts',
        value: this.getOpenFraudAlertCount(),
        icon: '🚨',
        tone: 'red'
      },
      {
        title: 'Recommendations',
        value: this.recommendations.length,
        icon: '💡',
        tone: 'orange'
      },
      {
        title: 'ML Experiments',
        value: this.mlExperiments.length,
        icon: '🧪',
        tone: 'dark'
      }
    ];
  }

  private buildCharts(): void {
    this.buildRoleChart();
    this.buildLeadStatusChart();
    this.buildPerformanceChart();
    this.buildPredictionChart();
    this.buildAlertChart();
  }

  private buildRoleChart(): void {
    const roles = ['ADMIN', 'SH', 'ZO', 'RM', 'BM', 'UL', 'IC'];

    const data = roles.map(role => {
      return this.users.filter(user => {
        const userRoles = user.roles || [];
        return userRoles.includes(role);
      }).length;
    });

    this.roleChartOption = {
      title: {text: 'Users by Role', left: 'center'},
      tooltip: {trigger: 'axis'},
      grid: {left: 42, right: 24, top: 62, bottom: 38},
      xAxis: {type: 'category', data: roles},
      yAxis: {type: 'value'},
      series: [
        {
          name: 'Users',
          type: 'bar',
          data
        }
      ]
    };
  }

  private buildLeadStatusChart(): void {
    const statuses = this.getUniqueValues(this.leads, 'status');

    const data = statuses.map(status => ({
      name: status,
      value: this.leads.filter(lead => lead.status === status).length
    }));

    this.leadStatusChartOption = {
      title: {text: 'Lead Status Distribution', left: 'center'},
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
    const topAgents = this.getTopPerformers();

    this.performanceChartOption = {
      title: {text: 'Top Agent Performance', left: 'center'},
      tooltip: {trigger: 'axis'},
      grid: {left: 42, right: 24, top: 62, bottom: 44},
      xAxis: {
        type: 'category',
        data: topAgents.map(item => item.nickname || item.username || item.agentId)
      },
      yAxis: {type: 'value', max: 100},
      series: [
        {
          name: 'Performance Score',
          type: 'bar',
          data: topAgents.map(item => Number(item.performanceScore || 0))
        }
      ]
    };
  }

  private buildPredictionChart(): void {
    const low = this.aiPredictions.filter(item => item.riskLevel === 'LOW').length;
    const medium = this.aiPredictions.filter(item => item.riskLevel === 'MEDIUM').length;
    const high = this.aiPredictions.filter(item => item.riskLevel === 'HIGH').length;

    this.predictionChartOption = {
      title: {text: 'AI Prediction Risk', left: 'center'},
      tooltip: {trigger: 'item'},
      legend: {bottom: 0},
      series: [
        {
          name: 'Risk Level',
          type: 'pie',
          radius: ['45%', '70%'],
          data: [
            {value: low, name: 'LOW'},
            {value: medium, name: 'MEDIUM'},
            {value: high, name: 'HIGH'}
          ]
        }
      ]
    };
  }

  private buildAlertChart(): void {
    const critical = this.fraudAlerts.filter(item => item.severity === 'CRITICAL').length;
    const high = this.fraudAlerts.filter(item => item.severity === 'HIGH').length;
    const medium = this.fraudAlerts.filter(item => item.severity === 'MEDIUM').length;
    const low = this.fraudAlerts.filter(item => item.severity === 'LOW').length;

    this.alertChartOption = {
      title: {text: 'Fraud Alert Severity', left: 'center'},
      tooltip: {trigger: 'axis'},
      grid: {left: 42, right: 24, top: 62, bottom: 38},
      xAxis: {type: 'category', data: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']},
      yAxis: {type: 'value'},
      series: [
        {
          name: 'Alerts',
          type: 'bar',
          data: [critical, high, medium, low]
        }
      ]
    };
  }

  private getUniqueValues(items: any[], fieldName: string): string[] {
    const values = items
      .map(item => item[fieldName])
      .filter(value => !!value);

    return [...new Set(values)];
  }
}
