import request from '@/utils/request'

export interface DepartmentItem {
  id: number
  departmentName: string
  parentId: number
  leader: string
  phone: string
  email: string
  sortOrder: number
  status: number
  createTime: string
  updateTime: string
  children?: DepartmentItem[]
}

export const getDepartmentTree = () => {
  return request.get<DepartmentItem[]>('/department/tree')
}

export const getDepartmentList = (params?: { current?: number; size?: number; departmentName?: string; status?: number }) => {
  return request.get<{ records: DepartmentItem[]; total: number }>('/department/list', { params })
}

export const getDepartmentAll = () => {
  return request.get<DepartmentItem[]>('/department/all')
}

export const getDepartmentDetail = (id: number) => {
  return request.get<DepartmentItem>(`/department/detail/${id}`)
}

export const createDepartment = (data: Partial<DepartmentItem>) => {
  return request.post('/department/create', data)
}

export const updateDepartment = (id: number, data: Partial<DepartmentItem>) => {
  return request.put(`/department/update/${id}`, data)
}

export const deleteDepartment = (id: number) => {
  return request.delete(`/department/delete/${id}`)
}
