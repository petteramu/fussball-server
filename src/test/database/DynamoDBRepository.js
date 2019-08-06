process.env.GAMES_TABLE = 'GAMES_TABLE'
process.env.RANKINGS_TABLE = 'RANKINGS_TABLE'

const repoFactory = require('../../database/DynamoDBRepository')
const db = repoFactory.getTestInstance()

const sinon = require('sinon')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const assert = chai.assert
const expect = chai.expect
const should = chai.should()

describe('DynamoDBRepository', function() {
    describe('updatePlayer', function() {
        beforeEach (() => {
            sinon.spy(db.provider, 'updateItemSimple')
        })
        afterEach (() => {
            db.provider.updateItemSimple.restore()
        })
        it('should call updateItemSimple with a table name', async function() {
            await db.updatePlayer('Test name', {})
            assert(db.provider.updateItemSimple.getCall(0).args[0], process.env.RANKINGS_TABLE)
        })
        it('Should update provide correct key object to updateItemSimple', async function() {
            await db.updatePlayer('Test name', {})
            assert(db.provider.updateItemSimple.getCall(0).args[1].name, 'Test name')
        })
        it('should only include parameters from the player schema', async function() {
            await db.updatePlayer('Test name', { name: 'testname', lastUpdated: 123, streak: 0, wins: 0, losses: 0, ranking: 1200, invalidKey: true })
            let keys = Object.keys(db.provider.updateItemSimple.getCall(0).args[2])
            assert(keys.indexOf('streak') > -1)
            assert(keys.indexOf('losses') > -1)
            assert(keys.indexOf('wins') > -1)
            assert(keys.indexOf('ranking') > -1)
            assert(keys.indexOf('lastUpdated') > -1)
            assert(keys.indexOf('name') > -1)
            assert(keys.indexOf('invalidKey') === -1)
        })
        it('should fail if given an object with cyclic references', async function() {
            let cycleChild  = {}
            let cyclicObj = { a: cycleChild }
            cycleChild.b = cyclicObj
            db.updatePlayer('Test name', cyclicObj).should.throw
        })
    })
})