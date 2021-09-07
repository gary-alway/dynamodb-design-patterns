import { lorem } from 'faker'
import { gameServiceFactory } from '../../src/service/gameService'
import { testDynamoClient } from '../awsTestClients'
import { testPlayerScore } from '../testFactories'

const service = gameServiceFactory(testDynamoClient)

describe('sparse indexes', () => {
  it('returns records from the GSI sparse index', async () => {
    const award = lorem.words(2)
    const score1 = testPlayerScore()
    const score2 = testPlayerScore({ award })
    const score3 = testPlayerScore()
    const score4 = testPlayerScore({ award })

    await Promise.all([
      service.savePlayerGameScore(score1),
      service.savePlayerGameScore(score2),
      service.savePlayerGameScore(score3),
      service.savePlayerGameScore(score4)
    ])

    const awards = await service.getAwards(award)
    expect(awards).toEqual(expect.arrayContaining([score2, score4]))
  })
})
