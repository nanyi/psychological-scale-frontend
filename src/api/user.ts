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
  userType: number
  status: number
  createTime: string
}

export interface PageRequest {
  pageNum: number
  pageSize: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  pageNum: number
  pageSize: number
}

export const login = (data: LoginRequest) => {
  return request.post<LoginResponse>('/auth/login', data)
}

export const getUserList = (params: PageRequest & { username?: string; phone?: string; status?: number }) => {
  return request.get<PageResult<UserItem>>('/user/list', { params })
}

export const getUserInfo = (id: number) => {
  return request.get<UserItem>(`/user/info/${id}`)
}

export const updateUser = (id: number, data: Partial<UserItem>) => {
  return request.post<void>(`/user/update/${id}`, data)
}

export const updateUserStatus = (id: number, status: number) => {
  return request.post<void>(`/user/status/${id}`, null, { params: { status } })
}

export const deleteUser = (id: number) => {
  return request.post<void>(`/user/delete/${id}`)
}
