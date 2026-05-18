import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {forkJoin} from 'rxjs';
import {EChartsCoreOption} from 'echarts/core';

import {DashboardService} from '../../../../core/services/dashboard.service';
import {AuthService} from '../../../../core/services/auth.service';
import {AlertsService} from '../../../../core/services/alerts.service';
import {AppPermission, AppPermissions} from '../../../../core/permissions/app-permissions';

import {SummaryCard} from '../../../../shared/components/dashboard/summary-card/summary-card';
import {DashboardSidebar} from '../../../../shared/components/dashboard/dashboard-sidebar/dashboard-sidebar';
import {DashboardTopbar} from '../../../../shared/components/dashboard/dashboard-topbar/dashboard-topbar';
import {ChartPanel} from '../../../../shared/components/dashboard/chart-panel/chart-panel';
import {DataTablePanel} from '../../../../shared/components/dashboard/data-table-panel/data-table-panel';
import {AlertsContainer} from '../../../../shared/components/ui/alerts-container/alerts-container';
import {LeadFormModal} from '../../../../shared/components/business/lead-form-modal/lead-form-modal';

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
  supervisorId?: number;
  supervisorUsername?: string;
}

type RmSection =
  | 'overview'
  | 'team'
  | 'leads'
  | 'performance'
  | 'recommendations';

type TeamTab = 'bm' | 'ul' | 'ic';

interface MenuItem {
  key: RmSection;
  label: string;
  icon: string;
  permission: AppPermission;
}

@Component({
  selector: 'app-rm-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SummaryCard,
    DashboardSidebar,
    DashboardTopbar,
    ChartPanel,
    DataTablePanel,
    AlertsContainer,
    LeadFormModal
  ],
  templateUrl: './rm-dashboard.html',
  styleUrls: ['./rm-dashboard.scss']
})
export class RmDashboard implements OnInit {
  readonly permissions = AppPermissions;

  activeSection: RmSection = 'overview';
  activeTeamTab: TeamTab = 'bm';

  loggedUser: LoggedUser | null = null;

  isLoading = false;

  users: any[] = [];
  leads: any[] = [];
  performanceRecords: any[] = [];
  aiPredictions: any[] = [];
  recommendations: any[] = [];

  teamBmUsers: any[] = [];
  teamUlUsers: any[] = [];
  teamIcUsers: any[] = [];

  teamBmIds: number[] = [];
  teamUlIds: number[] = [];
  teamIcIds: number[] = [];

  teamLeads: any[] = [];
  teamPerformance: any[] = [];
  teamPredictions: any[] = [];
  teamRecommendations: any[] = [];

  isLeadModalOpen = false;
  selectedLeadForEdit: any | null = null;
  isLeadViewMode = false;

  summaryCards: DashboardSummaryCard[] = [];

  leadStatusChartOption: EChartsCoreOption = {};
  teamPerformanceChartOption: EChartsCoreOption = {};
  predictionChartOption: EChartsCoreOption = {};

  menuItems: MenuItem[] = [
    {
      key: 'overview',
      label: 'Regional Overview',
      icon: '📊',
      permission: AppPermissions.DASHBOARD_TEAM_VIEW
    },
    {
      key: 'team',
      label: 'My Team',
      icon: '👥',
      permission: AppPermissions.USER_VIEW
    },
    {
      key: 'leads',
      label: 'Regional Leads',
      icon: '📋',
      permission: AppPermissions.LEAD_VIEW
    },
    {
      key: 'performance',
      label: 'Regional Performance',
      icon: '🏆',
      permission: AppPermissions.DASHBOARD_TEAM_VIEW
    },
    {
      key: 'recommendations',
      label: 'Recommendations',
      icon: '💡',
      permission: AppPermissions.RECOMMENDATION_VIEW
    }
  ];

  teamUserColumns: DashboardTableColumn[] = [
    {key: 'id', label: 'ID', type: 'number'},
    {key: 'username', label: 'Username'},
    {key: 'nickname', label: 'Name'},
    {key: 'email', label: 'Email'},
    {key: 'phone', label: 'Phone'},
    {key: 'supervisorUsername', label: 'Supervisor'},
    {key: 'status', label: 'Status', type: 'badge'}
  ];

  leadColumns: DashboardTableColumn[] = [
    {key: 'id', label: 'ID', type: 'number'},
    {
      key: 'name',
      label: 'Customer',
      fallbackKeys: ['customerName']
    },
    {key: 'nic', label: 'NIC'},
    {
      key: 'mobile',
      label: 'Mobile',
      fallbackKeys: ['phone', 'contactNumber']
    },
    {key: 'assignedUsername', label: 'IC'},
    {key: 'status', label: 'Status', type: 'badge'},
    {
      key: 'premium',
      label: 'Premium',
      type: 'number',
      fallbackKeys: ['expectedPremium']
    },
    {key: 'productType', label: 'Product'},
    {key: 'probability', label: 'Probability', type: 'badge'}
  ];

  performanceColumns: DashboardTableColumn[] = [
    {key: 'username', label: 'Agent'},
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
    {key: 'username', label: 'Agent'},
    {key: 'recommendationText', label: 'Recommendation'}
  ];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private alerts: AlertsService
  ) {
  }

  ngOnInit(): void {
    this.setDefaultSectionByPermission();
    this.loadLoggedUser();
  }

  get sidebarUserInfo(): DashboardUserInfo {
    return {
      username: this.loggedUser?.username || 'rm',
      displayName: this.displayName,
      email: this.loggedUser?.email,
      roleLabel: this.roleLabel
    };
  }

  get displayName(): string {
    return this.loggedUser?.nickname || this.loggedUser?.username || 'Regional Manager';
  }

  get roleLabel(): string {
    return this.loggedUser?.roles?.join(', ') || 'RM';
  }

  can(permission: AppPermission): boolean {
    return this.authService.hasPermission(permission);
  }

  getVisibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => this.can(item.permission));
  }

  setActiveSection(section: RmSection): void {
    const selectedItem = this.menuItems.find(item => item.key === section);

    if (selectedItem && this.can(selectedItem.permission)) {
      this.activeSection = section;
    }
  }

  setTeamTab(tab: TeamTab): void {
    this.activeTeamTab = tab;
  }

  loadDashboardData(showLoader: boolean = true): void {
    if (showLoader) {
      this.isLoading = true;
    }

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

        this.applyRmFilters();
        this.updateSummaryCards();
        this.buildCharts();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('RM dashboard load failed', error);
        this.isLoading = false;

        this.alerts.errorDialog(
          'RM dashboard data load failed. Please check backend API and server.',
          'Dashboard Load Failed'
        );
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
    if (event.action === 'view') {
      this.openViewLeadModal(event.row);
      return;
    }

    if (event.action === 'edit') {
      this.openEditLeadModal(event.row);
      return;
    }

    console.log('RM lead action:', event.action, event.row);
  }

  openViewLeadModal(lead: any): void {
    this.selectedLeadForEdit = lead;
    this.isLeadViewMode = true;
    this.isLeadModalOpen = true;
  }

  openEditLeadModal(lead: any): void {
    this.selectedLeadForEdit = lead;
    this.isLeadViewMode = false;
    this.isLeadModalOpen = true;
  }

  closeLeadModal(): void {
    this.isLeadModalOpen = false;
    this.selectedLeadForEdit = null;
    this.isLeadViewMode = false;
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
        }, 120);
      },
      error: (error) => {
        console.error('RM lead update failed', error);

        this.alerts.errorDialog(
          'Lead update failed. Please check the entered details and try again.',
          'Lead Update Failed'
        );
      }
    });
  }

  getActiveLeadCount(): number {
    return this.teamLeads.filter(lead => {
      const status = lead.status;
      return status === 'NEW' || status === 'IN_PROGRESS' || status === 'QUOTATION_SUBMITTED';
    }).length;
  }

  getCompletedLeadCount(): number {
    return this.teamLeads.filter(lead => lead.status === 'COMPLETED').length;
  }

  getCancelledLeadCount(): number {
    return this.teamLeads.filter(lead => lead.status === 'CANCELLED').length;
  }

  getAverageTeamScore(): number {
    if (!this.teamPerformance.length) {
      return 0;
    }

    const total = this.teamPerformance.reduce((sum, item) => {
      return sum + Number(item.performanceScore || 0);
    }, 0);

    return total / this.teamPerformance.length;
  }

  getTopTeamPerformers(): any[] {
    return [...this.teamPerformance]
      .sort((a, b) => Number(b.performanceScore || 0) - Number(a.performanceScore || 0))
      .slice(0, 8);
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
    const username = storedUser?.username || this.authService.getCurrentUsername();

    if (!username) {
      this.loggedUser = {
        username: 'rm',
        nickname: 'Regional Manager',
        email: '',
        roles: roles.length ? roles : ['RM']
      };

      this.alerts.errorDialog(
        'Logged user username is missing. Please login again.',
        'User Details Missing'
      );
      return;
    }

    this.loggedUser = {
      ...storedUser,
      username,
      roles: storedUser?.roles || roles
    };

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

        this.loadDashboardData();
      },
      error: (error) => {
        console.error('RM logged user fetch failed', error);

        this.alerts.errorDialog(
          'Logged user details could not be loaded. Please login again.',
          'User Details Missing'
        );
      }
    });
  }

  private applyRmFilters(): void {
    const rmId = Number(this.loggedUser?.id || 0);

    this.teamBmUsers = this.users.filter(user => {
      const isBm = (user.roles || []).includes('BM');
      return isBm && Number(user.supervisorId) === rmId;
    });

    this.teamBmIds = this.teamBmUsers.map(user => Number(user.id));

    this.teamUlUsers = this.users.filter(user => {
      const isUl = (user.roles || []).includes('UL');
      return isUl && this.teamBmIds.includes(Number(user.supervisorId));
    });

    this.teamUlIds = this.teamUlUsers.map(user => Number(user.id));

    this.teamIcUsers = this.users.filter(user => {
      const isIc = (user.roles || []).includes('IC');
      return isIc && this.teamUlIds.includes(Number(user.supervisorId));
    });

    this.teamIcIds = this.teamIcUsers.map(user => Number(user.id));

    this.teamLeads = this.leads.filter(lead =>
      this.teamIcIds.includes(Number(lead.assignedUserId || lead.agentId || lead.userId))
    );

    this.teamPerformance = this.performanceRecords.filter(item =>
      this.teamIcIds.includes(Number(item.agentId || item.userId))
    );

    this.teamPredictions = this.aiPredictions.filter(item =>
      this.teamIcIds.includes(Number(item.agentId || item.userId))
    );

    this.teamRecommendations = this.recommendations.filter(item =>
      this.teamIcIds.includes(Number(item.agentId || item.userId))
    );
  }

  private updateSummaryCards(): void {
    this.summaryCards = [
      {
        title: 'BM Team Members',
        value: this.teamBmUsers.length,
        icon: '👔',
        tone: 'blue'
      },
      {
        title: 'UL Team Members',
        value: this.teamUlUsers.length,
        icon: '👥',
        tone: 'green'
      },
      {
        title: 'IC Team Members',
        value: this.teamIcUsers.length,
        icon: '🧑‍💼',
        tone: 'orange'
      },
      {
        title: 'Regional Leads',
        value: this.teamLeads.length,
        icon: '📋',
        tone: 'purple'
      },
      {
        title: 'Average Score',
        value: this.getAverageTeamScore().toFixed(2),
        icon: '🏆',
        tone: 'dark'
      }
    ];
  }

  private buildCharts(): void {
    this.buildLeadStatusChart();
    this.buildTeamPerformanceChart();
    this.buildPredictionChart();
  }

  private buildLeadStatusChart(): void {
    const statuses = this.getUniqueValues(this.teamLeads, 'status');

    const data = statuses.map(status => ({
      name: status,
      value: this.teamLeads.filter(lead => lead.status === status).length
    }));

    this.leadStatusChartOption = {
      title: {text: 'Regional Lead Status', left: 'center'},
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

  private buildTeamPerformanceChart(): void {
    const topAgents = this.getTopTeamPerformers();

    this.teamPerformanceChartOption = {
      title: {text: 'Regional IC Performance', left: 'center'},
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
    const low = this.teamPredictions.filter(item => item.riskLevel === 'LOW').length;
    const medium = this.teamPredictions.filter(item => item.riskLevel === 'MEDIUM').length;
    const high = this.teamPredictions.filter(item => item.riskLevel === 'HIGH').length;

    this.predictionChartOption = {
      title: {text: 'Regional Prediction Risk', left: 'center'},
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

  private getUniqueValues(items: any[], fieldName: string): string[] {
    const values = items
      .map(item => item[fieldName])
      .filter(value => !!value);

    return [...new Set(values)];
  }
}
