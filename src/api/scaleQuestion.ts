import request from '@/utils/request'

export interface ScaleDimension {
  id: number
  scaleId: number
  dimensionName: string
  dimensionCode: string
  description: string
  sortOrder: number
  createTime: string
  updateTime: string
}

export interface ScaleQuestion {
  id: number
  scaleId: number
  dimensionId: number | null
  dimensionName: string
  questionNo: string
  questionText: string
  questionType: number
  questionTypeName: string
  isRequired: number
  isAnonymous: number
  options: QuestionOption[]
  sortOrder: number
  createTime: string
  updateTime: string
}

export interface QuestionOption {
  id: number
  questionId: number
  optionNo: string
  optionText: string
  optionValue: number
  score: number
  sortOrder: number
}

export const getDimensionsByScale = (scaleId: number) => {
  return request.get<ScaleDimension[]>(`/scale/dimensions/by-scale/${scaleId}`)
}

export const createDimension = (data: Partial<ScaleDimension>) => {
  return request.post('/scale/dimensions/create', data)
}

export const updateDimension = (id: number, data: Partial<ScaleDimension>) => {
  return request.put(`/scale/dimensions/update/${id}`, data)
}

export const deleteDimension = (id: number) => {
  return request.delete(`/scale/dimensions/delete/${id}`)
}

export const getQuestionsByScale = (scaleId: number) => {
  return request.get<ScaleQuestion[]>(`/scale/questions/by-scale/${scaleId}`)
}

export const getQuestionDetail = (id: number) => {
  return request.get<ScaleQuestion>(`/scale/questions/detail/${id}`)
}

export const createQuestion = (data: Partial<ScaleQuestion>) => {
  return request.post('/scale/questions/create', data)
}

export const updateQuestion = (id: number, data: Partial<ScaleQuestion>) => {
  return request.put(`/scale/questions/update/${id}`, data)
}

export const deleteQuestion = (id: number) => {
  return request.delete(`/scale/questions/delete/${id}`)
}

export type QuestionType = 1 | 2 | 3 | 4

export const questionTypeOptions = [
  { label: '单选题', value: 1 },
  { label: '多选题', value: 2 },
  { label: '填空题', value: 3 },
  { label: '量表题', value: 4 }
]
