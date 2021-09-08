import { QueryInput } from 'aws-sdk/clients/dynamodb'
import { pathOr } from 'ramda'
import { DDB_TABLE } from '../constants'
import { DynamoClient } from '../dynamoClient'

const dynamoRecordToRecord = (record: any): Book => {
  const { pk, sk, gsi1, gsi2, gsi3, ...data } = record

  return {
    ...data,
    author: pk,
    title: sk
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const bookServiceFactory = (client: DynamoClient) => {
  const getBookByTitle = async (title: string): Promise<Book | undefined> =>
    client
      .query({
        TableName: DDB_TABLE,
        IndexName: 'gsi1',
        KeyConditionExpression: '#sk = :sk',
        ExpressionAttributeNames: {
          '#sk': 'sk'
        },
        ExpressionAttributeValues: {
          ':sk': title
        }
      } as QueryInput)
      .then(res => {
        const record = pathOr(undefined, ['Items', 0], res)
        return record ? dynamoRecordToRecord(record) : undefined
      })

  const getBooksByReleaseYear = async (year: number): Promise<Book[]> =>
    client
      .query({
        TableName: DDB_TABLE,
        IndexName: 'gsi2',
        KeyConditionExpression: '#gsi2 = :gsi2',
        ExpressionAttributeNames: {
          '#gsi2': 'gsi2'
        },
        ExpressionAttributeValues: {
          ':gsi2': `${year}`
        }
      } as QueryInput)
      .then(res =>
        pathOr<Customer[]>([], ['Items'], res).map(dynamoRecordToRecord)
      )

  const getBooksByAuthor = async (author: string): Promise<Book[]> =>
    client
      .query({
        TableName: DDB_TABLE,
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: {
          '#pk': 'pk'
        },
        ExpressionAttributeValues: {
          ':pk': author
        }
      } as QueryInput)
      .then(res =>
        pathOr<Customer[]>([], ['Items'], res).map(dynamoRecordToRecord)
      )

  const saveBook = async (book: Book): Promise<void> => {
    const record = {
      pk: book.author,
      sk: book.title,
      release_year: book.release_year,
      gsi2: `${book.release_year}`
    }

    await client.putItem(record, DDB_TABLE)
  }

  return {
    saveBook,
    getBookByTitle,
    getBooksByAuthor,
    getBooksByReleaseYear
  }
}

export type BookService = ReturnType<typeof bookServiceFactory>
