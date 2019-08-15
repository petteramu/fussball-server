const _ = require('lodash')
const { handler } = require('../../actions/createTournament')
process.env.GAMES_TABLE = 'GAMES_TABLE'
process.env.RANKINGS_TABLE = 'RANKINGS_TABLE'
process.env.TOURNAMENT_TABLE = 'TOURNAMENT_TABLE'

const repoFactory = require('../../database/DynamoDBRepository')
const db = repoFactory.getTestInstance()

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const sinon = require('sinon')
const assert = chai.assert
const expect = chai.expect
const should = chai.should()

function getDummyPlayers(num) {
    let arr = []
    for(let i = 0; i < num; i++) arr.push({name: `Test ${i + 1}`})
    return arr
}

describe('Create tournament', function() {
    it('should fail it not given any data', async function() {
        handler().should.be.rejected
    })
    it('should fail if given invalid JSON', function() {
        handler({body: {name: "name"}}).should.be.rejected
    })
    it('should fail if players is not an array', function() {
        handler({body: JSON.stringify({"name": "Test"})}).should.be.rejected
    })
    it('should fail if less than 2 players', function() {
        handler({body: JSON.stringify({name: "Test", players: getDummyPlayers(1)})}).should.be.rejected
    })
    it('should fail if not given a tournament name', () => {
        handler({body: {}}).should.be.rejected
    })
    it('should fail if not given any options', () => {
        handler({body: JSON.stringify({name: "Test", players: getDummyPlayers(2)})}).should.be.rejected
    })
    it('should fail if double isn\'t a boolean', () => {
        handler(JSON.stringify({
            body: {
                name: "Test",
                options:{
                    double: 'not a boolean'
                },
                players: getDummyPlayers(2)
            }
        })).should.be.rejected
    })
    it('should not throw if given valid input', () => {
        handler({
            body: JSON.stringify({
                name: "Test",
                options:{
                    double: false
                },
                players: getDummyPlayers(2)
            })
        }).should.be.fulfilled
    })
})