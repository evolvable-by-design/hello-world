export interface TalkDetails {
  name: string
  speaker: string
  startTime: string
}

export type CreateTalkRequest = TalkDetails

export function validateTalkName(name: string) {
  return name.length >= 10 && name.length <= 80
}