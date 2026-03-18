import request from '@/utils/request'

export interface ExamRecord {
  id: number
  recordNo: string
  userId: number
  userName: string
  scaleId: number
  scaleName: string
  scaleCode: string
  status: number
  statusText: string
  progress: number
  totalQuestions: number
  answeredQuestions: number
  startTime: string
  endTime: string
  submitTime: string
  pauseTime: string
  resumeTime: string
  createTime: string
  updateTime: string
}

export interface ExamProgress {
  recordId: number
  currentQuestionIndex: number
  totalQuestions: number
  answeredCount: number
  lastAnswerTime: string
  answers: Record<number, number[]>
}

export interface ExamStartRequest {
  userId: number
  scaleId: number
  scaleCode: string
}

export const getExamRecordList = (params: { userId?: number; status?: number; current?: number; size?: number }) => {
  return request.get<{ records: ExamRecord[]; total: number; current: number; size: number }>('/exam-record/list', { params })
}

export const getExamRecordDetail = (id: number) => {
  return request.get<ExamRecord>(`/exam/record/detail/${id}`)
}

export const getExamRecordByNo = (recordNo: string) => {
  return request.get<ExamRecord>(`/exam/record/by-no/${recordNo}`)
}

export const getExamProgress = (recordId: number) => {
  return request.get<ExamProgress>(`/exam/progress/detail/${recordId}`)
}

export const startExam = (data: ExamStartRequest) => {
  return request.post<ExamRecord>('/exam/start', data)
}

export const submitExam = (recordId: number) => {
  return request.post(`/exam/submit/${recordId}`)
}

export const pauseExam = (recordId: number) => {
  return request.post(`/exam/pause/${recordId}`)
}

export const resumeExam = (recordId: number) => {
  return request.post(`/exam/resume/${recordId}`)
}
