import { address, datatype, internet, lorem } from 'faker'

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

export const testAddress = (overrides: Partial<Address> = {}): Address => ({
  firstLine: address.streetName(),
  city: address.city(),
  postcode: address.zipCode(),
  ...overrides
})

export const testCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  id: datatype.uuid(),
  username: internet.userName(),
  addresses: [testAddress()],
  ...overrides
})

export const testIngredient = (
  overrides: Partial<Ingredient> = {}
): Ingredient => ({
  id: datatype.uuid(),
  name: lorem.word(),
  ...overrides
})

export const testRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: datatype.uuid(),
  title: lorem.words(4),
  ingredients: [testIngredient(), testIngredient(), testIngredient()],
  ...overrides
})
