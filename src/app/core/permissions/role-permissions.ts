import {AppPermission, AppPermissions} from './app-permissions';

export const RolePermissions: Record<string, AppPermission[]> = {
  ADMIN: [
    AppPermissions.USER_VIEW,
    AppPermissions.USER_CREATE,
    AppPermissions.USER_UPDATE,
    AppPermissions.USER_DELETE,

    AppPermissions.LEAD_VIEW,
    AppPermissions.LEAD_CREATE,
    AppPermissions.LEAD_UPDATE,
    AppPermissions.LEAD_DELETE,

    AppPermissions.DASHBOARD_ADMIN_VIEW,
    AppPermissions.DASHBOARD_TEAM_VIEW,
    AppPermissions.DASHBOARD_AGENT_VIEW,

    AppPermissions.AI_ANALYTICS_VIEW,
    AppPermissions.AI_PIPELINE_RUN,

    AppPermissions.FRAUD_VIEW,
    AppPermissions.FRAUD_REVIEW,

    AppPermissions.RECOMMENDATION_VIEW,
    AppPermissions.ML_EXPERIMENT_VIEW
  ],

  SH: [
    AppPermissions.LEAD_VIEW,
    AppPermissions.DASHBOARD_TEAM_VIEW,
    AppPermissions.AI_ANALYTICS_VIEW,
    AppPermissions.FRAUD_VIEW,
    AppPermissions.RECOMMENDATION_VIEW
  ],

  ZO: [
    AppPermissions.LEAD_VIEW,
    AppPermissions.DASHBOARD_TEAM_VIEW,
    AppPermissions.AI_ANALYTICS_VIEW,
    AppPermissions.FRAUD_VIEW,
    AppPermissions.RECOMMENDATION_VIEW
  ],

  RM: [
    AppPermissions.LEAD_VIEW,
    AppPermissions.DASHBOARD_TEAM_VIEW,
    AppPermissions.AI_ANALYTICS_VIEW,
    AppPermissions.FRAUD_VIEW,
    AppPermissions.RECOMMENDATION_VIEW
  ],

  BM: [
    AppPermissions.LEAD_VIEW,
    AppPermissions.DASHBOARD_TEAM_VIEW,
    AppPermissions.AI_ANALYTICS_VIEW,
    AppPermissions.RECOMMENDATION_VIEW
  ],

  UL: [
    AppPermissions.DASHBOARD_TEAM_VIEW,
    AppPermissions.USER_VIEW,
    AppPermissions.LEAD_VIEW,
    AppPermissions.LEAD_UPDATE,
    AppPermissions.RECOMMENDATION_VIEW
  ],

  IC: [
    AppPermissions.LEAD_VIEW,
    AppPermissions.LEAD_CREATE,
    AppPermissions.LEAD_UPDATE,
    AppPermissions.DASHBOARD_AGENT_VIEW,
    AppPermissions.RECOMMENDATION_VIEW
  ]
};
