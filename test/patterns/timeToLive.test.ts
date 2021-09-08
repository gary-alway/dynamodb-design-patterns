import { datatype } from 'faker'
import { path } from 'ramda'
import { DDB_TABLE } from '../../src/constants'
import { testDynamoClient as client } from '../awsTestClients'
import { promiseTimeout } from '@alwaystudios/as-utils'

describe('time to live', () => {
  it('removes a row after ttl expires', async () => {
    const pk = datatype.uuid()
    const sk = 'ttl-demo'
    const ttl = Date.now() + 2000
    await client.putItem({ pk, sk, ttl }, DDB_TABLE)

    const res1 = await client.getItem({
      TableName: DDB_TABLE,
      Key: { pk, sk } as any
    })
    expect(path(['Item'], res1)).toMatchObject({ pk, sk })

    await promiseTimeout(2000)

    // todo: dynamodb local does not support TTL
  })
})
