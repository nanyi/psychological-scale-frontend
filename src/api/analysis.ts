import request from '@/utils/request'

export interface DashboardData {
  totalExams: number
  activeUsers: number
  completionRate: number
  avgDuration: number
  abnormalRate: number
  scaleRankings: ScaleUsageItem[]
  trendData: TrendDataItem[]
  summary: SummaryItem
}

export interface ScaleUsageItem {
  scaleId: number
  scaleName: string
  usageCount: number
  ratio: number
}

export interface TrendDataItem {
  date: string
  examCount: number
  userCount: number
}

export interface SummaryItem {
  totalRevenue: number
  todayExams: number
  todayUsers: number
}

export const getDashboardData = (startDate?: string, endDate?: string) => {
  return request.get<DashboardData>('/analysis/dashboard', { params: { startDate, endDate } })
}
