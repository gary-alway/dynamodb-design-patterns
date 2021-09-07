import { datatype, lorem, name } from 'faker'

export const testAudit = (overrides: Partial<Audit> = {}): Audit => ({
  username: name.firstName(),
  timestamp: new Date().toISOString(),
  result: 'pass',
  ...overrides
})

export const testEquipment = (
  overrides: Partial<Equipment> = {}
): Equipment => ({
  id: datatype.uuid(),
  name: lorem.word(),
  ...overrides
})
