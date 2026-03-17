import request from './index'

export interface ScaleCategory {
  id: number
  categoryName: string
  parentId: number
  sortOrder: number
  remark: string
  status: number
  createTime: string
  children?: ScaleCategory[]
}

export const getCategoryTree = () => {
  return request.get<ScaleCategory[]>('/scale-category/list')
}

export const getCategoryAll = () => {
  return request.get<ScaleCategory[]>('/scale-category/all')
}

export const createCategory = (data: Partial<ScaleCategory>) => {
  return request.post('/scale-category/create', data)
}

export const updateCategory = (id: number, data: Partial<ScaleCategory>) => {
  return request.put(`/scale-category/update/${id}`, data)
}

export const deleteCategory = (id: number) => {
  return request.delete(`/scale-category/delete/${id}`)
}
