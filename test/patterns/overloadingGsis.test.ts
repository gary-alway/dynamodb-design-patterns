import { QueryInput } from 'aws-sdk/clients/dynamodb'
import { datatype, lorem } from 'faker'
import { path } from 'ramda'
import { DDB_TABLE } from '../../src/constants'
import { testDynamoClient as client } from '../awsTestClients'

describe('overloading global secondary indexes', () => {
  it('sk can become the pk with a gsi key as the sk allowing searches across sk record types', async () => {
    const pk = datatype.uuid()
    const sk = 'sk-type-1'
    const gsi3 = lorem.words(3)
    await client.putItem({ pk, sk, gsi3 }, DDB_TABLE)
    await client.putItem(
      { pk, sk: 'sk-type-2', gsi3: lorem.words(2) },
      DDB_TABLE
    )

    const result = await client.query({
      TableName: DDB_TABLE,
      IndexName: 'gsi3',
      KeyConditionExpression: '#sk = :sk and #gsi3 = :gsi3',
      ExpressionAttributeNames: {
        '#sk': 'sk',
        '#gsi3': 'gsi3'
      },
      ExpressionAttributeValues: {
        ':sk': sk,
        ':gsi3': gsi3
      }
    } as QueryInput)

    expect(path(['Items', 0], result)).toEqual({ pk, sk, gsi3 })
  })
})
