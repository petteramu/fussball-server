process.env.GAMES_TABLE = 'GAMES_TABLE'
process.env.RANKINGS_TABLE = 'RANKINGS_TABLE'

const repoFactory = require('../../database/DynamoDBRepository')
const db = repoFactory.getTestInstance()

const { handler } = require('../../actions/addGame')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

chai.should()

describe('addGame', function() {
    describe('handler', function() {
        it('should fail if not given a winner', function() {
            handler({}).should.be.rejected
        })
        it('should fail it not given a white player', function() {
            handler({ winner: 'white', black: 'Test' }).should.be.rejected
        })
        it('should fail it not given a black player', function() {
            handler({ winner: 'black', white: 'Test' }).should.be.rejected
        })
        it('should succeed if given valid input', function() {
            handler({ winner: 'white', white: 'Petter', black: 'Test' }).should.be.fulfilled
        })
    })
})