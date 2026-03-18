import request from '@/utils/request'

export interface RoleItem {
  id: number
  roleName: string
  roleCode: string
  description: string
  status: number
  createTime: string
  updateTime: string
  permissions?: string[]
}

export interface PermissionItem {
  id: number
  permissionName: string
  permissionCode: string
  permissionType: number
  parentId: number
  path?: string
  component?: string
  icon?: string
  sortOrder: number
  status: number
  children?: PermissionItem[]
}

export const getRoleList = (params?: { current?: number; size?: number; roleName?: string; status?: number }) => {
  return request.get<{ records: RoleItem[]; total: number }>('/role/list', { params })
}

export const getRoleAll = () => {
  return request.get<RoleItem[]>('/role/all')
}

export const getRoleDetail = (id: number) => {
  return request.get<RoleItem>(`/role/detail/${id}`)
}

export const createRole = (data: Partial<RoleItem>) => {
  return request.post('/role/create', data)
}

export const updateRole = (id: number, data: Partial<RoleItem>) => {
  return request.put(`/role/update/${id}`, data)
}

export const deleteRole = (id: number) => {
  return request.delete(`/role/delete/${id}`)
}

export const getPermissionTree = () => {
  return request.get<PermissionItem[]>('/permission/tree')
}

export const getPermissionsByRole = (roleId: number) => {
  return request.get<string[]>(`/role/permissions/${roleId}`)
}

export const assignPermissions = (roleId: number, permissions: string[]) => {
  return request.post(`/role/permissions/${roleId}`, permissions)
}

export const getMenuTree = () => {
  return request.get<PermissionItem[]>('/permission/tree')
}

export const getMenuList = () => {
  return request.get<PermissionItem[]>('/permission/list')
}

export const assignRole = (userId: number, roleId: number) => {
  return request.post('/role/assign', null, { params: { userId, roleId } })
}

export const removeRole = (userId: number, roleId: number) => {
  return request.delete('/role/remove', { params: { userId, roleId } })
}

export const getUserRoles = (userId: number) => {
  return request.get<RoleItem[]>(`/role/by-user/${userId}`)
}
