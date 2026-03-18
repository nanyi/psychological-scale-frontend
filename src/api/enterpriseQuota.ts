import request from '@/utils/request'
import type { PageRequest, PageResult } from './user'

export interface EnterpriseQuota {
  id: number
  enterpriseId: number
  enterpriseName: string
  scaleId: number
  scaleName: string
  totalQuota: number
  usedQuota: number
  remainingQuota: number
  status: number
  statusName: string
  expireTime: string
  createTime: string
  updateTime: string
}

export interface EnterpriseQuotaDetail extends EnterpriseQuota {
  remark?: string
}

export interface CreateQuotaRequest {
  enterpriseId: number
  scaleId: number
  quota: number
  expireTime: string
  remark?: string
}

export interface RechargeRequest {
  enterpriseId: number
  scaleId: number
  quota: number
  remark?: string
}

export const getEnterpriseQuotaList = (params: PageRequest & { enterpriseId?: number }) => {
  return request.get<PageResult<EnterpriseQuota>>('/enterprise-quota/list', { params })
}

export const getEnterpriseQuotaDetail = (id: number) => {
  return request.get<EnterpriseQuotaDetail>(`/enterprise-quota/detail/${id}`)
}

export const getEnterpriseScaleQuota = (enterpriseId: number, scaleId: number) => {
  return request.get<EnterpriseQuota>(`/enterprise-quota/by-enterprise/${enterpriseId}/scale/${scaleId}`)
}

export const createEnterpriseQuota = (data: CreateQuotaRequest) => {
  return request.post<EnterpriseQuota>('/enterprise-quota/create', data)
}

export const useEnterpriseQuota = (data: { enterpriseId: number; scaleId: number; quantity: number }) => {
  return request.post<{ success: boolean; remainingQuota: number }>('/enterprise-quota/use', data)
}

export const rechargeEnterpriseQuota = (data: RechargeRequest) => {
  return request.post<EnterpriseQuota>('/enterprise-quota/recharge', data)
}

export const expireEnterpriseQuota = (id: number) => {
  return request.post(`/enterprise-quota/expire/${id}`)
}
