process.env.GAMES_TABLE = 'GAMES_TABLE'
process.env.RANKINGS_TABLE = 'RANKINGS_TABLE'

const repoFactory = require('../../database/DynamoDBRepository')
const db = repoFactory.getTestInstance()

const { handler, rollbackGame } = require('../../actions/deleteGame')

const sinon = require('sinon')
const chai = require('chai')
const assert = chai.assert
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

chai.should()

const TEST_GAME_1 = {
    white: {
        key: 'Test 1',
        change: 10,
        preRanking: 1200
    },
    black: {
        key: 'Test 2',
        change: -10,
        preRanking: 1200
    },
    winner: 'white',
    id: 'test_id',
    timstamp: 123456789
}

const TEST_GAME_2 = {
    white: {
        key: 'Test 1',
        change: -10,
        preRanking: 1200
    },
    black: {
        key: 'Test 2',
        change: 10,
        preRanking: 1200
    },
    winner: 'black',
    id: 'test_id',
    timstamp: 123456789
}

const TEST_GAME_3 = {
    white: {
        key: 'Test 1',
        change: -5,
        preRanking: 1200
    },
    black: {
        key: 'Test 2',
        change: 5,
        preRanking: 1200
    },
    winner: 'remis',
    id: 'test_id',
    timstamp: 123456789
}

const TEST_PLAYER = {
    name: 'Test 1',
    ranking: 1200
}

describe('deleteGame', function() {
    describe('rollbackGame', function() {
        before(() => {
            sinon.stub(db, 'getPlayer').callsFake(() => TEST_PLAYER)
        })
        beforeEach(() => {
            sinon.spy(db, 'updatePlayer')
        })
        afterEach(() => {
            db.updatePlayer.restore()
        })
        it('should fail if not given a game', async function() {
            rollbackGame(null).should.be.rejected
        })
        it('should call update player twice with correct arguments when white wins', async function() {
            await rollbackGame(TEST_GAME_1)
            assert(db.updatePlayer.getCall(0).args[0] === TEST_GAME_1.white.key, 'white name should be equal')
            assert(db.updatePlayer.getCall(0).args[1].ranking === TEST_PLAYER.ranking - TEST_GAME_1.white.change, 'white ranking should reset')
            assert(db.updatePlayer.getCall(1).args[0] === TEST_GAME_1.black.key, 'black name should be equal')
            assert(db.updatePlayer.getCall(1).args[1].ranking === TEST_PLAYER.ranking - TEST_GAME_1.black.change, 'black ranking should reset')
        })
        it('should call update player twice with correct arguments when black wins', async function() {
            await rollbackGame(TEST_GAME_2)
            assert(db.updatePlayer.getCall(0).args[0] === TEST_GAME_2.white.key, 'name should be equal')
            assert(db.updatePlayer.getCall(0).args[1].ranking === TEST_PLAYER.ranking - TEST_GAME_2.white.change, 'ranking should reset')
            assert(db.updatePlayer.getCall(1).args[0] === TEST_GAME_2.black.key, 'name should be equal')
            assert(db.updatePlayer.getCall(1).args[1].ranking === TEST_PLAYER.ranking - TEST_GAME_2.black.change, 'ranking should reset')
        })
        it('should call update player twice with correct arguments when remis', async function() {
            await rollbackGame(TEST_GAME_3)
            assert(db.updatePlayer.getCall(0).args[0] === TEST_GAME_3.white.key, 'name should be equal')
            assert(db.updatePlayer.getCall(0).args[1].ranking === TEST_PLAYER.ranking - TEST_GAME_3.white.change, 'ranking should reset')
            assert(db.updatePlayer.getCall(1).args[0] === TEST_GAME_3.black.key, 'name should be equal')
            assert(db.updatePlayer.getCall(1).args[1].ranking === TEST_PLAYER.ranking - TEST_GAME_3.black.change, 'ranking should reset')
        })
        it('should call db.removeGame with correct id', async function() {
            sinon.spy(db, 'removeGame')
            await rollbackGame(TEST_GAME_1)
            assert(db.removeGame.getCall(0).args[0] === TEST_GAME_1.id, 'id in removeGame should equal id given to rollbackGame')
            db.removeGame.restore()
        })
    })
})