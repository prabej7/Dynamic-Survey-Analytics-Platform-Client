


import api from "./api";

export interface DashboardOverview {
  totalSurveys: number;
  publishedSurveys: number;
  totalResponses: number;
  responsesToday: number;
  responsesThisWeek: number;
  responsesThisMonth: number;
}

export interface ResponseBySurvey {
  surveyId: string;
  title: string;
  responses: number;
}

export interface RecentResponse {
  id: string;
  surveyId: string;
  surveyTitle: string;
  submittedAt: string;
}

export interface DashboardAnalytics {
  overview: DashboardOverview;
  responsesBySurvey: ResponseBySurvey[];
  recentResponses: RecentResponse[];
}

interface DashboardApiResponse {
  success: boolean;
  data: DashboardAnalytics;
}

export const getDashboardAnalytics =
  async (): Promise<DashboardAnalytics> => {
    const response =
      await api.get<DashboardApiResponse>(
        "/dashboard/analytics"
      );

    return response.data.data;
  };