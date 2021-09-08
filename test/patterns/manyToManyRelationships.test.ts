import { foodServiceFactory } from '../../src/service/foodService'
import { testDynamoClient } from '../awsTestClients'
import { testIngredient, testRecipe } from '../testFactories'

const service = foodServiceFactory(testDynamoClient)

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-adjacency-graphs.html

describe('managing many to many relationships', () => {
  let ingredients: Ingredient[]
  let recipes: Recipe[]

  beforeAll(async () => {
    ingredients = [...Array(20)].map(_ => testIngredient())

    const recipe1 = testRecipe({
      ingredients: [ingredients[0], ingredients[2], ingredients[3]]
    })
    const recipe2 = testRecipe({
      ingredients: [
        ingredients[2],
        ingredients[3],
        ingredients[4],
        ingredients[5]
      ]
    })
    const recipe3 = testRecipe({
      ingredients: [
        ingredients[6],
        ingredients[7],
        ingredients[8],
        ingredients[9],
        ingredients[2]
      ]
    })
    const recipe4 = testRecipe({
      ingredients: [
        ingredients[10],
        ingredients[11],
        ingredients[12],
        ingredients[13],
        ingredients[2]
      ]
    })

    recipes = [recipe1, recipe2, recipe3, recipe4]

    await Promise.all([ingredients.map(i => service.saveIngredient(i))])
    await Promise.all([recipes.map(r => service.saveRecipe(r))])
  })

  it('query all recipes that contain an ingredient', async () => {
    const recipesForIngredient = await service.getAllRecipesWithIngredient(
      ingredients[2].id
    )

    const expected = [
      recipes[0].id,
      recipes[1].id,
      recipes[2].id,
      recipes[3].id
    ]

    expect(recipesForIngredient).toEqual(expect.arrayContaining(expected))
  })

  it('query all ingredients for a recipe', async () => {
    const ingredientsForRecipe = await service.getAllIngredientsForRecipe(
      recipes[0].id
    )

    const expected = [ingredients[0].id, ingredients[2].id, ingredients[3].id]

    expect(ingredientsForRecipe).toEqual(expect.arrayContaining(expected))
  })

  it('gets a recipe', async () => {
    const ingredient1 = testIngredient({
      id: 'ingredient1',
      name: 'ingredient1'
    })
    const ingredient2 = testIngredient({
      id: 'ingredient2',
      name: 'ingredient2'
    })
    const recipe = testRecipe({
      id: 'test1',
      title: 'test1',
      ingredients: [ingredient1]
    })

    await service.saveIngredient(ingredient1)
    await service.saveIngredient(ingredient2)
    await service.saveRecipe(recipe)

    const result = await service.getRecipe('test1')
    expect(result).toEqual(recipe)
  })
})
