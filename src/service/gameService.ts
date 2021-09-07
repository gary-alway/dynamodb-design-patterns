import { DynamoDB } from 'aws-sdk'
import { QueryInput } from 'aws-sdk/clients/dynamodb'
import { omit, pathOr } from 'ramda'
import { DDB_TABLE } from '../constants'
import { DynamoClient } from '../dynamoClient'

const PREFIX = 'player#'

const dynamoRecordToRecord = (record: any): Score => {
  const { pk, sk, gsi2, ...data } = record

  return {
    ...data,
    playerId: (pk as string).replace(PREFIX, ''),
    gameId: sk,
    award: gsi2
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const gameServiceFactory = (client: DynamoClient) => {
  const getPlayerGameScore = async (
    playerId: string,
    gameId: string
  ): Promise<Score | undefined> =>
    client
      .getItem({
        TableName: DDB_TABLE,
        Key: {
          pk: `${PREFIX}${playerId}`,
          sk: gameId
        } as DynamoDB.Key
      })
      .then(res => {
        const record = pathOr(undefined, ['Item'], res)
        return record ? dynamoRecordToRecord(record) : undefined
      })

  const savePlayerGameScore = async (playerGameScore: Score): Promise<void> => {
    const id = playerGameScore.playerId.replace(PREFIX, '')

    const record = {
      pk: `${PREFIX}${id}`,
      sk: playerGameScore.gameId,
      ...omit(['playerId', 'gameId', 'award'], playerGameScore),
      gsi2: playerGameScore.award
    }

    await client.putItem(record, DDB_TABLE)
  }

  const getAwards = async (award: string) =>
    client
      .query({
        TableName: DDB_TABLE,
        IndexName: 'gsi2',
        KeyConditionExpression: '#gsi2 = :gsi2',
        ExpressionAttributeNames: {
          '#gsi2': 'gsi2'
        },
        ExpressionAttributeValues: {
          ':gsi2': award
        }
      } as QueryInput)
      .then(res =>
        pathOr<EquipmentRecord[]>([], ['Items'], res).map(dynamoRecordToRecord)
      )

  return {
    getPlayerGameScore,
    savePlayerGameScore,
    getAwards
  }
}

export type EquipmentService = ReturnType<typeof gameServiceFactory>
