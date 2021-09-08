import { DynamoDB } from 'aws-sdk'
import { QueryInput } from 'aws-sdk/clients/dynamodb'
import { omit, pathOr } from 'ramda'
import { DDB_TABLE } from '../constants'
import { DynamoClient } from '../dynamoClient'

const PREFIX = 'customer#'

const dynamoRecordToRecord = (record: any): Customer => {
  const { pk, sk, gsi3, ...data } = record

  return {
    ...data,
    id: (pk as string).replace(PREFIX, '')
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const customerServiceFactory = (client: DynamoClient) => {
  const getCustomer = async (id: string): Promise<Customer | undefined> =>
    client
      .getItem({
        TableName: DDB_TABLE,
        Key: {
          pk: `${PREFIX}${id}`,
          sk: PREFIX
        } as DynamoDB.Key
      })
      .then(res => {
        const record = pathOr(undefined, ['Item'], res)
        return record ? dynamoRecordToRecord(record) : undefined
      })

  const saveCustomer = async (customer: Customer): Promise<void> => {
    const id = customer.id.replace(PREFIX, '')

    const record = {
      pk: `${PREFIX}${id}`,
      sk: PREFIX,
      ...omit(['id'], customer),
      gsi3: customer.username
    }

    await client.putItem(record, DDB_TABLE)
  }

  const searchCustomers = async (username: string): Promise<Customer[]> =>
    client
      .query({
        TableName: DDB_TABLE,
        IndexName: 'gsi3',
        KeyConditionExpression: '#sk = :sk and begins_with (#gsi3, :gsi3)',
        ExpressionAttributeNames: {
          '#sk': 'sk',
          '#gsi3': 'gsi3'
        },
        ExpressionAttributeValues: {
          ':sk': PREFIX,
          ':gsi3': username
        }
      } as QueryInput)
      .then(res =>
        pathOr<Customer[]>([], ['Items'], res).map(dynamoRecordToRecord)
      )

  return {
    getCustomer,
    saveCustomer,
    searchCustomers
  }
}

export type CustomerService = ReturnType<typeof customerServiceFactory>
