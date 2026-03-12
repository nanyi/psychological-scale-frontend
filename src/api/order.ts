import request from './index'
import type { PageRequest, PageResult } from './user'

export interface OrderItem {
  id: number
  orderNo: string
  userId: number
  userName: string
  phone: string
  scaleId: number
  scaleName: string
  amount: number
  status: number
  statusName: string
  payTime: string
  createTime: string
}

export const getOrderList = (params: PageRequest & { orderNo?: string; phone?: string; status?: number }) => {
  return request.get<PageResult<OrderItem>>('/order/list', { params })
}

export const getOrderPage = (data: PageRequest & { orderNo?: string; phone?: string; status?: number }) => {
  return request.post<PageResult<OrderItem>>('/order/page', data)
}

export const getOrderDetail = (id: number) => {
  return request.get<OrderItem>(`/order/detail/${id}`)
}

export const createOrder = (data: Partial<OrderItem>) => {
  return request.post('/order/create', data)
}

export const cancelOrder = (id: number) => {
  return request.post(`/order/cancel/${id}`)
}

export const refundOrder = (id: number, reason: string) => {
  return request.post(`/order/refund/${id}`, { reason })
}
