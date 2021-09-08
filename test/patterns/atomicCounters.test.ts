import { datatype } from 'faker'
import { path } from 'ramda'
import { DDB_TABLE } from '../../src/constants'
import { testDynamoClient as client } from '../awsTestClients'

describe('atomic counters', () => {
  it('increments an atomic counter', async () => {
    const pk = datatype.uuid()
    const sk = 'atomic-update'
    const testing = 1
    await client.putItem({ pk, sk, testing }, DDB_TABLE)

    const res1 = await client.getItem({
      TableName: DDB_TABLE,
      Key: { pk, sk } as any
    })
    expect(path(['Item', 'testing'], res1)).toBe(1)

    const res2 = await client.updateItem({
      TableName: DDB_TABLE,
      Key: {
        pk,
        sk
      },
      UpdateExpression: 'set testing = testing + :inc',
      ExpressionAttributeValues: {
        ':inc': 1
      },
      ReturnValues: 'UPDATED_NEW'
    })

    expect(path(['Attributes', 'testing'], res2)).toBe(2)
  })
})
