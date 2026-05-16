import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {forkJoin} from 'rxjs';
import {NgxEchartsDirective} from 'ngx-echarts';
import {EChartsCoreOption} from 'echarts/core';

import {DashboardService} from '../../../../core/services/dashboard.service';
import {AuthService} from '../../../../core/services/auth.service';
import {AppPermission, AppPermissions} from '../../../../core/permissions/app-permissions';
import {DashboardSummaryCard} from '../../../../shared/components/models/dashboard-ui.model';
import {SummaryCard} from '../../../../shared/components/dashboard/summary-card/summary-card';

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
  imports: [CommonModule, NgxEchartsDirective, SummaryCard],
  templateUrl: './ic-dashboard.html',
  styleUrls: ['./ic-dashboard.scss'],
})
export class IcDashboard implements OnInit {
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

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {
  }

  get displayName(): string {
    return this.loggedUser?.nickname || this.loggedUser?.username || 'Insurance Consultant';
  }

  get roleLabel(): string {
    return this.loggedUser?.roles?.join(', ') || 'IC';
  }

  ngOnInit(): void {
    this.loadLoggedUser();
    this.setDefaultSectionByPermission();
    this.loadDashboardData();
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
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

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
      },
      error: (error) => {
        console.error('IC dashboard load failed', error);
        this.errorMessage = 'Dashboard data load failed. Please check backend API, CORS, and Spring Boot server.';
        this.isLoading = false;
      }
    });
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

  getLeadCustomerName(lead: any): string {
    return lead.customerName || lead.name || lead.fullName || lead.clientName || '-';
  }

  getLeadMobile(lead: any): string {
    return lead.mobile || lead.phone || lead.contactNumber || lead.customerMobile || '-';
  }

  getLeadPremium(lead: any): string | number {
    return lead.premium || lead.expectedPremium || lead.totalPremium || '-';
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
        username: 'agent',
        nickname: 'Insurance Consultant',
        email: '',
        roles: roles.length ? roles : ['IC']
      };
      return;
    }

    this.loggedUser = {
      ...storedUser,
      roles: storedUser.roles || roles
    };
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
