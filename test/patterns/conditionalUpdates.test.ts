import { datatype } from 'faker'
import { path } from 'ramda'
import { DDB_TABLE } from '../../src/constants'
import { testDynamoClient as client } from '../awsTestClients'

describe('conditional updates', () => {
  it('does not update a fixed value based on a condition', async () => {
    const pk = datatype.uuid()
    const sk = 'conditional-update'
    const testing = 'fixed value'
    await client.putItem({ pk, sk, testing }, DDB_TABLE)

    const res1 = await client.getItem({
      TableName: DDB_TABLE,
      Key: { pk, sk } as any
    })
    expect(path(['Item', 'testing'], res1)).toBe('fixed value')

    await expect(
      client.updateItem({
        TableName: DDB_TABLE,
        Key: {
          pk,
          sk
        },
        UpdateExpression: 'set testing = :newVal',
        ConditionExpression: ':newVal = :condition',
        ExpressionAttributeValues: {
          ':newVal': 'new value',
          ':condition': 'fixed value'
        }
      })
    ).rejects.toEqual(new Error('The conditional request failed'))
  })
})
