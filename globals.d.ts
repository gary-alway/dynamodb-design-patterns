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

declare type Address = {
  firstLine: string
  secondLine?: string
  city: string
  postcode: string
}

declare type Customer = {
  id: string
  username: string
  addresses: Address[]
}

declare type Book = {
  author: string
  title: string
  release_year: number
}

declare type Ingredient = {
  id: string
  name: string
}

declare type Recipe = {
  id: string
  title: string
  ingredients: Ingredient[]
}
