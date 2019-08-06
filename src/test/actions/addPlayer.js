process.env.GAMES_TABLE = 'GAMES_TABLE'
process.env.RANKINGS_TABLE = 'RANKINGS_TABLE'

const repoFactory = require('../../database/DynamoDBRepository')
const db = repoFactory.getTestInstance()

const { handler } = require('../../actions/addPlayer')

const sinon = require('sinon')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const assert = chai.assert
const expect = chai.expect
const should = chai.should()

describe('addPlayer', function () {
    describe('handler', function () {
        it('Should fail when given an empty name', function () {
            handler(null).should.be.rejected
        })
        it('Should succeed if given a non-existing name', function() {
            handler({ name: 'Test name' }).should.be.fulfilled
        })
    })
})