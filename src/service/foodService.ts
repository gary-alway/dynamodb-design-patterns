import DynamoDB, { QueryInput } from 'aws-sdk/clients/dynamodb'
import { omit, pathOr } from 'ramda'
import { DDB_TABLE } from '../constants'
import { DynamoClient } from '../dynamoClient'

const RECIPE = 'recipe#'
const INGREDIENT = 'ingredient#'

const dynamoRecipeRecordToRecord = (record: any): Recipe => {
  const { pk, sk, ...data } = record

  return {
    ...data,
    id: (pk as string).replace(RECIPE, '')
  }
}

const dynamoIngredientRecordToRecord = (record: any): Ingredient => {
  const { pk, sk, ...data } = record

  return {
    ...data,
    id: (pk as string).replace(INGREDIENT, '')
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const foodServiceFactory = (client: DynamoClient) => {
  const saveIngredient = async (ingredient: Ingredient): Promise<void> => {
    const id = ingredient.id.replace(INGREDIENT, '')
    const pk = `${INGREDIENT}${id}`

    const record = {
      pk,
      sk: pk,
      ...omit(['id'], ingredient)
    }

    await client.putItem(record, DDB_TABLE)
  }

  const saveRecipe = async (recipe: Recipe): Promise<void> => {
    const id = recipe.id.replace(RECIPE, '')
    const pk = `${RECIPE}${id}`

    const mainRecord = {
      pk,
      sk: pk,
      ...omit(['id', 'ingredients'], recipe)
    }

    const ingredientRecords = recipe.ingredients.map(ingredient => ({
      pk,
      sk: `${INGREDIENT}${ingredient.id}`
    }))

    await Promise.all([
      client.putItem(mainRecord, DDB_TABLE),
      ...ingredientRecords.map(r => client.putItem(r, DDB_TABLE))
    ])
  }

  const getAllRecipesWithIngredient = async (ingredientId: string) =>
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
          ':pk': RECIPE,
          ':sk': `${INGREDIENT}${ingredientId}`
        }
      } as QueryInput)
      .then(res =>
        pathOr([], ['Items'], res).map(({ pk }) =>
          (pk as string).replace(RECIPE, '')
        )
      )

  const getAllIngredientsForRecipe = async (recipeId: string) =>
    client
      .query({
        TableName: DDB_TABLE,
        KeyConditionExpression: '#pk = :pk and begins_with (#sk, :sk)',
        ExpressionAttributeNames: {
          '#pk': 'pk',
          '#sk': 'sk'
        },
        ExpressionAttributeValues: {
          ':pk': `${RECIPE}${recipeId}`,
          ':sk': INGREDIENT
        }
      } as QueryInput)
      .then(res =>
        pathOr([], ['Items'], res).map(({ sk }) =>
          (sk as string).replace(INGREDIENT, '')
        )
      )

  const getIngredient = async (id: string): Promise<Ingredient | undefined> => {
    const baseRecord = await client.getItem({
      TableName: DDB_TABLE,
      Key: {
        pk: `${INGREDIENT}${id}`,
        sk: `${INGREDIENT}${id}`
      } as DynamoDB.Key
    })

    const ingredient = pathOr(undefined, ['Item'], baseRecord)

    return ingredient ? dynamoIngredientRecordToRecord(ingredient) : undefined
  }

  const getRecipe = async (id: string): Promise<Recipe | undefined> => {
    const baseRecord = await client.getItem({
      TableName: DDB_TABLE,
      Key: {
        pk: `${RECIPE}${id}`,
        sk: `${RECIPE}${id}`
      } as DynamoDB.Key
    })

    const baseRecipe = pathOr(undefined, ['Item'], baseRecord)

    if (!baseRecipe) return

    const ingredientIds = await getAllIngredientsForRecipe(id)
    let ingredients: Ingredient[] = []

    for (const i of ingredientIds) {
      const ingredient = await getIngredient(i)
      if (ingredient) ingredients.push(ingredient)
    }

    return { ...dynamoRecipeRecordToRecord(baseRecipe), ingredients }
  }

  return {
    getIngredient,
    getRecipe,
    saveIngredient,
    saveRecipe,
    getAllRecipesWithIngredient,
    getAllIngredientsForRecipe
  }
}

export type FoodService = ReturnType<typeof foodServiceFactory>
