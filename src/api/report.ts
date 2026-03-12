import request from './index'
import type { PageRequest, PageResult } from './user'

export interface ReportItem {
  id: number
  reportNo: string
  userId: number
  userName: string
  scaleId: number
  scaleName: string
  score: number
  level: string
  status: number
  statusName: string
  createTime: string
}

export const getReportList = (params: PageRequest & { reportNo?: string; userName?: string; status?: number }) => {
  return request.get<PageResult<ReportItem>>('/report/list', { params })
}

export const getReportPage = (data: PageRequest & { reportNo?: string; userName?: string; status?: number }) => {
  return request.post<PageResult<ReportItem>>('/report/page', data)
}

export const getReportDetail = (id: number) => {
  return request.get<ReportItem>(`/report/detail/${id}`)
}

export const deleteReport = (id: number) => {
  return request.delete(`/report/delete/${id}`)
}

export const downloadReport = (id: number) => {
  return request.get(`/report/download/${id}`, { responseType: 'blob' })
}

export const shareReport = (id: number) => {
  return request.get<string>(`/report/share/${id}`)
}
