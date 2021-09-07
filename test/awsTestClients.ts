import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createDynamoClient } from '../src/dynamoClient'
import { DDB_TABLE, LOCAL_AWS_CONFIG } from '../src/constants'

export const testDynamoClient = createDynamoClient(
  new DocumentClient(LOCAL_AWS_CONFIG)
)

export const purgeAll = async (): Promise<void> =>
  testDynamoClient.truncateTable(DDB_TABLE, 'pk', 'sk')
