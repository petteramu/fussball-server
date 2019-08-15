const _ = require('lodash')
const roundRobin = require('../../utils/roundRobin')
process.env.GAMES_TABLE = 'GAMES_TABLE'
process.env.RANKINGS_TABLE = 'RANKINGS_TABLE'

const repoFactory = require('../../database/DynamoDBRepository')
const db = repoFactory.getTestInstance()

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const assert = chai.assert
const expect = chai.expect
const should = chai.should()

function getDummyPlayers(num) {
    let arr = []
    for(let i = 0; i < num; i++) arr.push({name: `Test ${i + 1}`})
    return arr
}

describe('Round Robin', function() {
    describe('createRoundRobinSchedule', function() {
        it('should fail if not given any players', function() {
            roundRobin().should.be.rejected
        })
        it('should fail if not given any double', function() {
            roundRobin([]).should.be.rejected
        })
        it('should fail if double isn\' a boolean', function() {
            roundRobin([], ).should.be.rejected
        })
        it('should create a match schedule if given valid arguments', function() {
            roundRobin(getDummyPlayers(2), false).should.be.fulfilled
        })
        it('should create a schedule where each players plays all opponents once in single rounds (even)', async function () {
            const DUMMY_PLAYERS = getDummyPlayers(6)
            let matches = _.flatten(await roundRobin(DUMMY_PLAYERS, false, false))
            let players = {}
            for(let playerObj of DUMMY_PLAYERS) players[playerObj.name] = []
            for(let match of matches) {
                players[match.white].push(match.black)
                players[match.black].push(match.white)
            }
            for(let name in players) {
                expect(_.uniq(players[name]).length).to.equal(DUMMY_PLAYERS.length - 1)
            }
        })
        it('should create a schedule where each players plays all opponents once in single rounds (odd)', async function () {
            const DUMMY_PLAYERS = getDummyPlayers(5)
            let matches = _.flatten(await roundRobin(DUMMY_PLAYERS, false, false))
            let players = {}
            for(let playerObj of DUMMY_PLAYERS) players[playerObj.name] = []
            for(let match of matches) {
                players[match.white].push(match.black)
                players[match.black].push(match.white)
            }
            for(let name in players) {
                if(name === 'BYE') continue
                expect(_.uniq(players[name]).length).to.equal(DUMMY_PLAYERS.length - 2) // -2 Because we dont' count byes
            }
        })
        it('should create a schedule where each players plays all opponents twice in double rounds (even)', async function () {
            const DUMMY_PLAYERS = getDummyPlayers(6)
            let matches = _.flatten(await roundRobin(DUMMY_PLAYERS, true, false))
            let players = {}
            for(let playerObj of DUMMY_PLAYERS) players[playerObj.name] = []
            for(let match of matches) {
                players[match.white].push(match.black)
                players[match.black].push(match.white)
            }
            for(let name in players) {
                let round1 = players[name].slice(0, players[name].length / 2)
                let round2 = players[name].slice(players[name].length / 2)
                expect(_.uniq(round1).length).to.equal(DUMMY_PLAYERS.length - 1)
                expect(_.uniq(round2).length).to.equal(DUMMY_PLAYERS.length - 1)
            }
        })
        it('should create a schedule where each players plays all opponents twice in double rounds (odd)', async function () {
            const DUMMY_PLAYERS = getDummyPlayers(5)
            let matches = _.flatten(await roundRobin(DUMMY_PLAYERS, true, false))
            let players = {}
            for(let playerObj of DUMMY_PLAYERS) players[playerObj.name] = []
            for(let match of matches) {
                players[match.white].push(match.black)
                players[match.black].push(match.white)
            }
            for(let name in players) {
                if(name === 'BYE') continue
                let round1 = players[name].slice(0, players[name].length / 2)
                let round2 = players[name].slice(players[name].length / 2)
                expect(_.uniq(round1).length).to.equal(DUMMY_PLAYERS.length - 2)
                expect(_.uniq(round2).length).to.equal(DUMMY_PLAYERS.length - 2)
            }
        })
        it('should make sure each player plays at most one more game as white than black in single rounds(even)', async function() {
            const DUMMY_PLAYERS = getDummyPlayers(6)
            let matches = _.flatten(await roundRobin(DUMMY_PLAYERS, false, false))

            let players = {}
            for(let playerObj of DUMMY_PLAYERS) players[playerObj.name] = {white: 0, black: 0}

            for(let match of matches) {
                players[match.white].white++
                players[match.black].black++
            }
            for(let name in players) {
                assert(Math.abs(players[name].white - players[name].black) <= 1)
            }
        })
        it('should make sure each player plays half of the games as white in single rounds(odd)', async function() {
            const DUMMY_PLAYERS = getDummyPlayers(5)
            let matches = _.flatten(await roundRobin(DUMMY_PLAYERS, false, false))

            let players = {}
            for(let playerObj of DUMMY_PLAYERS) players[playerObj.name] = {white: 0, black: 0}

            for(let match of matches) {
                players[match.white].white++
                players[match.black].black++
            }
            for(let name in players) {
                assert(players[name].white == players[name].black)
            }
        })
    })
})