import request from '@/utils/request'

export interface ServiceInfo {
  id: number
  serviceName: string
  serviceCode: string
  apiBaseUrl: string
  status: number
  statusName: string
  lastCallTime: string
  responseTime: number
}

export interface ApiCallLog {
  id: number
  serviceName: string
  apiPath: string
  method: string
  status: number
  statusName: string
  responseTime: number
  errorMsg: string
  callTime: string
}

export interface MonitorStatistics {
  totalCalls: number
  successCalls: number
  failCalls: number
  avgResponseTime: number
  availabilityRate: number
}

export const getServiceList = () => {
  return request.get<ServiceInfo[]>('/thirdparty/monitor/services')
}

export const getServiceStatus = (serviceCode: string) => {
  return request.get<ServiceInfo>(`/thirdparty/monitor/service/${serviceCode}/status`)
}

export const getApiCallLogs = (params: {
  serviceCode?: string
  current: number
  size: number
}) => {
  return request.get<{ records: ApiCallLog[]; total: number }>('/thirdparty/monitor/api-logs', { params })
}

export const getMonitorStatistics = () => {
  return request.get<MonitorStatistics>('/thirdparty/monitor/statistics')
}

export const testService = (serviceCode: string) => {
  return request.post(`/thirdparty/monitor/service/${serviceCode}/test`)
}
