import request from './index'

export interface DashboardData {
  totalAssessments: number
  activeUsers: number
  scaleCount: number
  abnormalRate: number
}

export interface ScaleRankItem {
  rank: number
  name: string
  count: number
  percentage: string
}

export interface TrendData {
  date: string
  count: number
}

export interface AnalysisData {
  assessmentGrowth: number
  userGrowth: number
  monthlyRevenue: number
  abnormalRate: number
  scaleRanking: ScaleRankItem[]
  trendData: TrendData[]
}

export const getDashboardData = () => {
  return request.get<DashboardData>('/analysis/dashboard')
}

export const getAnalysisData = () => {
  return request.get<AnalysisData>('/analysis/overview')
}

export const getScaleRanking = () => {
  return request.get<ScaleRankItem[]>('/analysis/scale-ranking')
}

export const getTrendData = (days: number = 7) => {
  return request.get<TrendData[]>('/analysis/trend', { params: { days } })
}
