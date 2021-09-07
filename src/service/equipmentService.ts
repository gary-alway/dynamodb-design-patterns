import { DynamoDB } from 'aws-sdk'
import { PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb'
import { omit, pathOr } from 'ramda'
import { DDB_TABLE } from '../constants'
import { DynamoClient } from '../dynamoClient'

const getKeyForId = (id: string, version = 0) =>
  ({ pk: id, sk: `v${version}` } as DynamoDB.Key)

const dynamoRecordToRecord = (record: any): EquipmentRecord => {
  const { pk, sk, ...data } = record

  return {
    ...data,
    id: pk
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
        Key: getKeyForId(id, version)
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
    const existing = await getEquipment(item.id)

    const latestVersion = existing ? existing.latest! + 1 : 1

    const record: EquipmentRecord = {
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
              ...getKeyForId(item.id),
              ...record
            } as PutItemInputAttributeMap
          }
        },
        {
          Put: {
            TableName: DDB_TABLE,
            Item: {
              ...getKeyForId(item.id, latestVersion),
              ...omit(['latest'], record)
            } as PutItemInputAttributeMap
          }
        }
      ]
    })
  }

  return {
    getEquipment,
    getEquipmentByVersion,
    saveEquipment
  }
}

export type EquipmentService = ReturnType<typeof equipmentServiceFactory>
