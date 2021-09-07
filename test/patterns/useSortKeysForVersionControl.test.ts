import { testDynamoClient } from '../awsTestClients'
import { equipmentServiceFactory } from '../../src/service/equipmentService'
import { testEquipment } from '../testFactories'
import { internet, lorem } from 'faker'

const service = equipmentServiceFactory(testDynamoClient)

describe('using sort keys for version control', () => {
  it('stores version history in dynamodb', async () => {
    const usernames = [...Array(4)].map(_ => internet.userName())
    const names = [...Array(4)].map(_ => lorem.words(3))
    const item = testEquipment({ name: names[0] })
    await service.saveEquipment(item, usernames[0], 'fail')
    await service.saveEquipment({ ...item, name: names[1] }, usernames[1])
    await service.saveEquipment(
      { ...item, name: names[2] },
      usernames[2],
      'fail'
    )
    await service.saveEquipment({ ...item, name: names[3] }, usernames[3])

    const v1 = await service.getEquipmentByVersion(item.id, 1)
    expect(v1).toEqual({
      name: names[0],
      result: 'fail',
      username: usernames[0],
      timestamp: expect.any(String),
      id: item.id
    })
    const v2 = await service.getEquipmentByVersion(item.id, 2)
    expect(v2).toEqual({
      name: names[1],
      result: 'pass',
      username: usernames[1],
      timestamp: expect.any(String),
      id: item.id
    })
    const v3 = await service.getEquipmentByVersion(item.id, 3)
    expect(v3).toEqual({
      name: names[2],
      result: 'fail',
      username: usernames[2],
      timestamp: expect.any(String),
      id: item.id
    })
    const v4 = await service.getEquipmentByVersion(item.id, 4)
    expect(v4).toEqual({
      name: names[3],
      result: 'pass',
      username: usernames[3],
      timestamp: expect.any(String),
      id: item.id
    })
    const v0 = await service.getEquipment(item.id)
    expect(v0).toEqual({ ...v4, latest: 4 })

    const allEquipment = await service.getAllEquipment()
    expect(allEquipment).toEqual(expect.arrayContaining([v0]))
    expect(allEquipment).toEqual(expect.not.arrayContaining([v1, v2, v3]))

    const failedAudits = await service.getEquipmentByAuditResult(
      item.id,
      'fail'
    )
    expect(failedAudits).toEqual(expect.arrayContaining([v1, v3]))
  })
})
