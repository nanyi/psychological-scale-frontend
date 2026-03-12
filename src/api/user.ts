import request from './index'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
    nickname: string
    avatar: string
    role: string
  }
}

export interface UserItem {
  id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  email: string
  role: string
  status: number
  createTime: string
}

export interface PageRequest {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
}

export const login = (data: LoginRequest) => {
  return request.post<LoginResponse>('/user/login', data)
}

export const getUserList = (params: PageRequest & { name?: string; phone?: string; status?: number }) => {
  return request.get<PageResult<UserItem>>('/user/list', { params })
}

export const getUserPage = (data: PageRequest & { name?: string; phone?: string; status?: number }) => {
  return request.post<PageResult<UserItem>>('/user/page', data)
}

export const getUserInfo = (id: number) => {
  return request.get<UserItem>(`/user/info/${id}`)
}

export const createUser = (data: Partial<UserItem>) => {
  return request.post('/user/create', data)
}

export const updateUser = (id: number, data: Partial<UserItem>) => {
  return request.put(`/user/update/${id}`, data)
}

export const deleteUser = (id: number) => {
  return request.delete(`/user/delete/${id}`)
}

export const updateUserStatus = (id: number, status: number) => {
  return request.post(`/user/status/${id}`, { status })
}
