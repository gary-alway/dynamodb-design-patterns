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

declare type EquipmentRecord = Omit<Equipment & Audit, 'id'>
