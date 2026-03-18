import request from '@/utils/request'
import type { PageRequest, PageResult } from './user'

export interface OrderItem {
  id: number
  orderNo: string
  userId: number
  userName: string
  phone: string
  email?: string
  scaleId: number
  scaleName: string
  amount: number
  originalAmount: number
  discountAmount: number
  status: number
  statusName: string
  payTime: string
  createTime: string
  expireTime?: string
  payChannel?: string
  orderType: number
  orderTypeName: string
  refundStatus?: number
  refundAmount?: number
}

export interface OrderDetail {
  id: number
  orderNo: string
  userId: number
  userName: string
  phone: string
  email?: string
  orderType: number
  orderTypeName: string
  originalAmount: number
  discountAmount: number
  actualAmount: number
  status: number
  statusName: string
  payChannel?: string
  payTime?: string
  createTime: string
  expireTime?: string
  cancelTime?: string
  refundTime?: string
  items: OrderDetailItem[]
}

export interface OrderDetailItem {
  id: number
  scaleId: number
  scaleName: string
  scaleCover?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  refundStatus: number
  refundStatusName: string
  refundAmount?: number
  refundTime?: string
}

export const getOrderList = (params: PageRequest & { orderNo?: string; phone?: string; status?: number }) => {
  return request.get<PageResult<OrderItem>>('/order/list', { params })
}

export const getOrderPage = (data: PageRequest & { orderNo?: string; phone?: string; status?: number }) => {
  return request.post<PageResult<OrderItem>>('/order/page', data)
}

export const getOrderDetail = (id: number) => {
  return request.get<OrderDetail>(`/order/detail/${id}`)
}

export const applyRefund = (orderId: number, reason: string) => {
  return request.post('/refund/apply', { orderId, reason })
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
