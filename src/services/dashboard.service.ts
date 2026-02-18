import api from "./api";
import type {
  DashboardOverview,
  StatisticsItem,
  RevenueReport,
} from "../types/dashboard";

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await api.get("/dashboard/overview");
  return response.data.data;
};

interface StatisticsParams {
  year?: number;
  month?: number;
}

export const getStatistics = async (
  params?: StatisticsParams,
): Promise<{
  data: StatisticsItem[];
  filters: { year?: number; month?: number; grouping: string };
}> => {
  const response = await api.get("/dashboard/statistics", { params });
  return response.data;
};

interface RevenueParams {
  year?: number;
  month?: number;
  event_id?: string;
}

export const getRevenueReport = async (
  params?: RevenueParams,
): Promise<{
  data: RevenueReport;
  filters: { year?: number; month?: number; event_id?: string };
}> => {
  const response = await api.get("/dashboard/revenue", { params });
  return response.data;
};
