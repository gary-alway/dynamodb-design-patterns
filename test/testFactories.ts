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
