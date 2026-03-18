import request from '@/utils/request'

export interface SystemBasicSetting {
  systemName: string
  systemLogo: string
  systemDescription: string
  copyright: string
}

export interface SystemSecuritySetting {
  loginTimeout: number
  passwordMinLength: number
  passwordRequireSpecialChar: boolean
  passwordRequireNumber: boolean
  passwordRequireUppercase: boolean
  loginFailLock: number
  ipWhitelist: string
}

export interface SystemNotificationSetting {
  emailEnabled: boolean
  smsEnabled: boolean
  siteMessageEnabled: boolean
  emailTemplate: string
  smsTemplate: string
}

export interface SystemSetting {
  basic: SystemBasicSetting
  security: SystemSecuritySetting
  notification: SystemNotificationSetting
}

export const getSystemSetting = () => {
  return request.get<SystemSetting>('/system/setting')
}

export const updateBasicSetting = (data: SystemBasicSetting) => {
  return request.post<void>('/system/setting/basic', data)
}

export const updateSecuritySetting = (data: SystemSecuritySetting) => {
  return request.post<void>('/system/setting/security', data)
}

export const updateNotificationSetting = (data: SystemNotificationSetting) => {
  return request.post<void>('/system/setting/notification', data)
}
