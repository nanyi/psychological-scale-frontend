import request from './index'
import type { PageRequest, PageResult } from './user'

export interface ScaleItem {
  id: number
  scaleName: string
  scaleCode: string
  categoryId: number
  categoryName: string
  description: string
  questionCount: number
  price: number
  status: number
  viewCount: number
  useCount: number
  createTime: string
  updateTime: string
}

export const getScaleList = (params: PageRequest & { categoryId?: number; status?: number }) => {
  return request.get<PageResult<ScaleItem>>('/scale/list', { params })
}

export const getScalePage = (data: PageRequest & { categoryId?: number; status?: number; name?: string }) => {
  return request.post<PageResult<ScaleItem>>('/scale/page', data)
}

export const getScaleDetail = (id: number) => {
  return request.get<ScaleItem>(`/scale/detail/${id}`)
}

export const getScaleByCode = (code: string) => {
  return request.get<ScaleItem>(`/scale/by-code/${code}`)
}

export const createScale = (data: Partial<ScaleItem>) => {
  return request.post('/scale/create', data)
}

export const updateScale = (id: number, data: Partial<ScaleItem>) => {
  return request.put(`/scale/update/${id}`, data)
}

export const deleteScale = (id: number) => {
  return request.delete(`/scale/delete/${id}`)
}

export const publishScale = (id: number) => {
  return request.post(`/scale/publish/${id}`)
}

export const offlineScale = (id: number) => {
  return request.post(`/scale/offline/${id}`)
}
