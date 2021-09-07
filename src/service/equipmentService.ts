import { DynamoDB } from 'aws-sdk'
import { PutItemInputAttributeMap, QueryInput } from 'aws-sdk/clients/dynamodb'
import { omit, pathOr } from 'ramda'
import { DDB_TABLE } from '../constants'
import { DynamoClient } from '../dynamoClient'

const PREFIX = 'equipment#'

const getKeyForId = (id: string, version = 0) =>
  ({ pk: `${PREFIX}${id}`, sk: `v${version}` } as DynamoDB.Key)

const dynamoRecordToRecord = (record: any): EquipmentRecord => {
  const { pk, sk, lsi1, ...data } = record

  return {
    ...data,
    id: (pk as string).replace(PREFIX, '')
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const equipmentServiceFactory = (client: DynamoClient) => {
  const getEquipmentByVersion = async (
    id: string,
    version: number
  ): Promise<EquipmentRecord | undefined> =>
    client
      .getItem({
        TableName: DDB_TABLE,
        Key: getKeyForId(id.replace(PREFIX, ''), version)
      })
      .then(res => {
        const record = pathOr(undefined, ['Item'], res)
        return record ? dynamoRecordToRecord(record) : undefined
      })

  const getEquipment = async (
    id: string
  ): Promise<EquipmentRecord | undefined> => getEquipmentByVersion(id, 0)

  const saveEquipment = async (
    item: Equipment,
    username: string,
    result: AuditResult = 'pass'
  ): Promise<void> => {
    const id = item.id.replace(PREFIX, '')
    const existing = await getEquipment(id)

    const latestVersion = existing ? existing.latest! + 1 : 1

    const record: Omit<EquipmentRecord, 'id'> = {
      name: item.name,
      username,
      timestamp: new Date().toISOString(),
      result,
      latest: latestVersion
    }

    await client.transaction({
      TransactItems: [
        {
          Put: {
            TableName: DDB_TABLE,
            Item: {
              ...getKeyForId(id),
              ...record
            } as PutItemInputAttributeMap
          }
        },
        {
          Put: {
            TableName: DDB_TABLE,
            Item: {
              ...getKeyForId(id, latestVersion),
              ...omit(['latest'], record),
              lsi1: result
            } as PutItemInputAttributeMap
          }
        }
      ]
    })
  }

  const getEquipmentByAuditResult = async (id: string, result: AuditResult) =>
    client
      .query({
        TableName: DDB_TABLE,
        IndexName: 'lsi1',
        KeyConditionExpression: '#pk = :pk and #lsi1 = :lsi1',
        ExpressionAttributeNames: {
          '#pk': 'pk',
          '#lsi1': 'lsi1'
        },
        ExpressionAttributeValues: {
          ':pk': `${PREFIX}${id}`,
          ':lsi1': result
        }
      } as QueryInput)
      .then(res =>
        pathOr<EquipmentRecord[]>([], ['Items'], res).map(dynamoRecordToRecord)
      )

  const getAllEquipment = async () =>
    client
      .query({
        TableName: DDB_TABLE,
        IndexName: 'gsi1',
        KeyConditionExpression: '#sk = :sk and begins_with (#pk, :pk)',
        ExpressionAttributeNames: {
          '#pk': 'pk',
          '#sk': 'sk'
        },
        ExpressionAttributeValues: {
          ':pk': PREFIX,
          ':sk': 'v0'
        }
      } as QueryInput)
      .then(res =>
        pathOr<EquipmentRecord[]>([], ['Items'], res).map(dynamoRecordToRecord)
      )

  return {
    getEquipment,
    getEquipmentByVersion,
    saveEquipment,
    getAllEquipment,
    getEquipmentByAuditResult
  }
}

export type EquipmentService = ReturnType<typeof equipmentServiceFactory>
