const createResponse = require('../../utils/createResponse')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const assert = chai.assert
const expect = chai.expect
const should = chai.should()

describe('utils/createResponse', function() {
    it('successfully create an object', function () {
        createResponse('Test response').should.be.a('object')
    })
})