declare type Equipment = {
  id: string
  name: string
}

declare type AuditResult = 'pass' | 'fail'

declare type Audit = {
  username: string
  timestamp: string
  result: AuditResult
  latest?: number
}

declare type EquipmentRecord = Equipment & Audit

declare type Score = {
  playerId: string
  gameId: string
  score: number
  timestamp: string
  award?: string
}
