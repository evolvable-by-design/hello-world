export type Role = 'user' | 'admin'

export type TalkCategory = 'API Design' | 'API Maintenance' | 'API Management'

export interface TalkDetails {
  title: string
  speaker: string
  startTime: string
  role: Role
  category: TalkCategory
}