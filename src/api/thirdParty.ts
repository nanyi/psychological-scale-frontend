import request from '@/utils/request'
import type { PageRequest, PageResult } from './user'

export interface ThirdPartyConfig {
  id: number
  platformName: string
  platformCode: string
  apiBaseUrl: string
  appKey: string
  appSecret: string
  callbackUrl: string
  syncStrategy: number
  syncStrategyName: string
  status: number
  statusName: string
  remark: string
  createTime: string
  updateTime: string
}

export const getThirdPartyActiveList = () => {
  return request.get<ThirdPartyConfig[]>('/thirdparty/config/active')
}

export const getThirdPartyConfigDetail = (id: number) => {
  return request.get<ThirdPartyConfig>(`/thirdparty/config/detail/${id}`)
}

export const getThirdPartyConfigByCode = (code: string) => {
  return request.get<ThirdPartyConfig>(`/thirdparty/config/by-code/${code}`)
}

export const getThirdPartyConfigPage = (data: PageRequest & { platformName?: string; status?: number }) => {
  return request.post<PageResult<ThirdPartyConfig>>('/thirdparty/config/page', data)
}

export const createThirdPartyConfig = (data: Partial<ThirdPartyConfig>) => {
  return request.post('/thirdparty/config/create', data)
}

export const updateThirdPartyConfig = (id: number, data: Partial<ThirdPartyConfig>) => {
  return request.put(`/thirdparty/config/update/${id}`, data)
}

export const deleteThirdPartyConfig = (id: number) => {
  return request.delete(`/thirdparty/config/delete/${id}`)
}

export const enableThirdPartyConfig = (id: number) => {
  return request.post(`/thirdparty/config/enable/${id}`)
}

export const disableThirdPartyConfig = (id: number) => {
  return request.post(`/thirdparty/config/disable/${id}`)
}

export const testThirdPartyConfig = (id: number) => {
  return request.get<{ success: boolean; message: string }>(`/thirdparty/config/test/${id}`)
}

export interface SyncLog {
  id: number
  configId: number
  platformName: string
  syncType: string
  syncTypeName: string
  status: number
  statusName: string
  successCount: number
  failCount: number
  errorMsg: string
  startTime: string
  endTime: string
  duration: number
}

export interface SyncStatistics {
  totalCount: number
  successCount: number
  failCount: number
  successRate: number
}

export const getSyncLogs = (params: {
  configId?: number
  syncType?: string
  current: number
  size: number
}) => {
  return request.get<PageResult<SyncLog>>('/thirdparty/sync/logs', { params })
}

export const getSyncStatistics = (configId: number) => {
  return request.get<SyncStatistics>(`/thirdparty/sync/statistics/${configId}`)
}

export const triggerSync = (configId: number) => {
  return request.post(`/thirdparty/sync/scales/${configId}`)
}
