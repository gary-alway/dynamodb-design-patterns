import { datatype, internet, lorem } from 'faker'

export const testAudit = (overrides: Partial<Audit> = {}): Audit => ({
  username: internet.userName(),
  timestamp: new Date().toISOString(),
  result: 'pass',
  ...overrides
})

export const testEquipment = (
  overrides: Partial<Equipment> = {}
): Equipment => ({
  id: datatype.uuid(),
  name: lorem.words(3),
  ...overrides
})

export const testPlayerScore = (overrides: Partial<Score> = {}): Score => ({
  playerId: datatype.uuid(),
  gameId: datatype.uuid(),
  score: datatype.number(),
  timestamp: new Date().toISOString(),
  ...overrides
})
