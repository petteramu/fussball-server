process.env.GAMES_TABLE = 'GAMES_TABLE'
process.env.RANKINGS_TABLE = 'RANKINGS_TABLE'

const repoFactory = require('../../database/DynamoDBRepository')
const db = repoFactory.getTestInstance()

const { handler, recalculateGames } = require('../../actions/recalculateGames')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const assert = chai.assert
const expect = chai.expect
chai.use(chaiAsPromised)

chai.should()

const TEST_GAMES_1 = [
    {
        id: '1eb9d6ef-cc2c-4e43-9310-86aadd1ff159',
        timestamp: 123456,
        winner: 'white',
        white: { key: 'Test person 1', change: 16, preRanking: 1200 },
        black: { key: 'Test person 2', change: -16, preRanking: 1200 }
    },
    {
        id: 'bd15033d-3e57-44fa-b6c2-97f606961b59',
        timestamp: 123457,
        winner: 'white',
        white: {
            key: 'Test person 1',
            change: 14.53049847102443,
            preRanking: 1216
        },
        black: {
            key: 'Test person 2',
            change: -14.53049847102443,
            preRanking: 1184
        }
    },
    {
        id: '51f2dc41-9385-4233-88a5-888f54ee625c',
        timestamp: 123458,
        winner: 'white',
        white: {
            key: 'Test person 2',
            change: 18.7833648374135,
            preRanking: 1169.4695015289756
        },
        black: {
            key: 'Test person 1',
            change: -18.7833648374135,
            preRanking: 1230.5304984710244
        }
    },
    {
        id: '51f2dc41-9385-4233-88a5-888f54ee625c',
        timestamp: 123458,
        winner: 'remis',
        white: {
            key: 'Test person 2',
            change: 1.0803048472148475,
            preRanking: 1188.252866366389
        },
        black: {
            key: 'Test person 1',
            change: -1.0803048472148475,
            preRanking: 1211.747133633611
        }
    }
]

const TEST_GAMES_2 = [
    {
        id: '1eb9d6ef-cc2c-4e43-9310-86aadd1ff159',
        timestamp: 123456,
        winner: 'white',
        white: { key: 'Test person 1', change: 16, preRanking: 1200 },
        black: { key: 'Test person 2', change: -16, preRanking: 1200 }
    },
    {
        id: 'bd15033d-3e57-44fa-b6c2-97f606961b59',
        timestamp: 123457,
        winner: 'white',
        white: {
            key: 'Test person 1',
            change: 12,
            preRanking: 1210
        },
        black: {
            key: 'Test person 2',
            change: -12.53049847102443,
            preRanking: 1164
        }
    },
    {
        id: '51f2dc41-9385-4233-88a5-888f54ee625c',
        timestamp: 123458,
        winner: 'white',
        white: {
            key: 'Test person 2',
            change: 14,
            preRanking: 1162
        },
        black: {
            key: 'Test person 1',
            change: -12,
            preRanking: 1211
        }
    },
    {
        id: '51f2dc41-9385-4233-88a5-888f54ee625c',
        timestamp: 123458,
        winner: 'remis',
        white: {
            key: 'Test person 2',
            change: 14,
            preRanking: 1162
        },
        black: {
            key: 'Test person 1',
            change: -12,
            preRanking: 1211
        }
    }
]

describe.only('Recalculategames', () => {
    it('should return an array of games of the same length as it is given', async () => {
        let result = await recalculateGames(TEST_GAMES_1)
        assert(result.games.length === TEST_GAMES_1.length, `New games(${result.games.length}) length does not match original games length(${TEST_GAMES_1.length})`)
    })

    it('should return an empty array if given undefined or null', async () => {
        let result = await recalculateGames(null)
        expect(result.games.length).to.equal(0)
        result = await recalculateGames(undefined)
        expect(result.games.length).to.equal(0)
    })
    it('should return games with the same elo changes when given a correctly calculated list of games', async () => {
        let result = await recalculateGames(TEST_GAMES_1)
        const lastGame = result.games[result.games.length - 1]
        const originalLastGame = TEST_GAMES_1[TEST_GAMES_1.length - 1]
        expect(lastGame.white.preRanking + lastGame.white.change).to.equal(originalLastGame.white.preRanking + originalLastGame.white.change)
        expect(lastGame.black.preRanking + lastGame.black.change).to.equal(originalLastGame.black.preRanking + originalLastGame.black.change)
    })
    it('should return games with the correct elo changes when given a wrongly calculated list of games', async () => {
        let result = await recalculateGames(TEST_GAMES_2)
        const lastGame = result.games[result.games.length - 1]
        const originalLastGame = TEST_GAMES_2[TEST_GAMES_2.length - 1]
        expect(lastGame.white.preRanking + lastGame.white.change).to.equal(1189.333171213604)
        expect(lastGame.black.preRanking + lastGame.black.change).to.equal(1210.666828786396)
        expect(lastGame.white.preRanking + lastGame.white.change).to.not.equal(originalLastGame.white.preRanking + originalLastGame.white.change)
        expect(lastGame.black.preRanking + lastGame.black.change).to.not.equal(originalLastGame.black.preRanking + originalLastGame.black.change)
    })
    it('should return games with the same id as the original games', async () => {
        let result = await recalculateGames(TEST_GAMES_1)
        for(let i = 0; i < result.games.length; i++) {
            let newGame = result.games[i]
            let originalGame = TEST_GAMES_1[i]
            expect(newGame.id).to.equal(originalGame.id)
        }
    })
})