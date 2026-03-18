import request from '@/utils/request'

export interface UserGroupItem {
  id: number
  groupName: string
  groupCode: string
  description: string
  memberCount: number
  createTime: string
  updateTime: string
}

export const getGroupList = (params?: { current?: number; size?: number; groupName?: string }) => {
  return request.get<{ records: UserGroupItem[]; total: number }>('/user-group/list', { params })
}

export const getGroupAll = () => {
  return request.get<UserGroupItem[]>('/user-group/all')
}

export const getGroupDetail = (id: number) => {
  return request.get<UserGroupItem>(`/user-group/detail/${id}`)
}

export const createGroup = (data: Partial<UserGroupItem>) => {
  return request.post('/user-group/create', data)
}

export const updateGroup = (id: number, data: Partial<UserGroupItem>) => {
  return request.put(`/user-group/update/${id}`, data)
}

export const deleteGroup = (id: number) => {
  return request.delete(`/user-group/delete/${id}`)
}

export const getGroupMembers = (groupId: number) => {
  return request.get<number[]>(`/user-group/members/${groupId}`)
}

export const addGroupMembers = (groupId: number, userIds: number[]) => {
  return request.post(`/user-group/members/${groupId}`, userIds)
}

export const removeGroupMembers = (groupId: number, userIds: number[]) => {
  return request.delete(`/user-group/members/${groupId}`, { data: userIds })
}
