export type DashboardTone =
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'purple'
  | 'dark';

export interface DashboardMenuItem<TSection = string> {
  key: TSection;
  label: string;
  icon: string;
  permission?: string;
}

export interface DashboardSummaryCard {
  title: string;
  value: number | string;
  icon: string;
  tone: DashboardTone;
}

export interface DashboardUserInfo {
  username: string;
  displayName: string;
  email?: string;
  roleLabel: string;
}

export interface DashboardTableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'badge';
}

export interface DashboardTableAction {
  label: string;
  icon?: string;
  tone?: 'primary' | 'danger' | 'warning' | 'success';
  permission?: string;
  action: string;
}
