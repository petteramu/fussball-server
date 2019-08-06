const DDBProviderFactory = require('../../database/DynamoDBProvider')
const sinon = require('sinon')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const assert = chai.assert
const expect = chai.expect
const should = chai.should
should()

provider = DDBProviderFactory.getTestInstance()

describe('DynamoDB Provider', function() {
    describe('createItem', function () {
        const TABLE_NAME = 'tableName'
        const ITEM_DATA = { a: 1 }

        beforeEach(function () {
            sinon.spy(provider.docClient, 'put')
        })

		afterEach(function () {
			provider.docClient.put.restore()
		})

        it('should reject the promise if given invalid tableName', function () {
            return provider.createItem(undefined, {}).should.be.rejected
        })

        it('should reject if item is not an object', function () {
            return provider.createItem(TABLE_NAME, 'someRandomString').should.be.rejected
        })

        it('should call .put', async function() {
            await provider.createItem(TABLE_NAME, ITEM_DATA)
            assert(provider.docClient.put.calledOnce)
        })

        it('should call .put with correct tableName', async function() {
            await provider.createItem(TABLE_NAME, ITEM_DATA)
            assert(provider.docClient.put.getCall(0).args[0].TableName, TABLE_NAME)
        })

        it('should call .put with correct item data', async function() {
            await provider.createItem(TABLE_NAME, ITEM_DATA)
            assert(provider.docClient.put.getCall(0).args[0].Item, ITEM_DATA)
        })
    })

    describe('getItem', function() {
        const TABLE_NAME = 'tableName'
        const KEYS = { a: 1 }

        beforeEach(function () {
            sinon.spy(provider.docClient, 'get')
        })

		afterEach(function () {
			provider.docClient.get.restore()
        })

        it('should reject the promise if given invalid tableName', function () {
            return provider.getItem(undefined, {}).should.be.rejected
        })

        it('should reject if keys is not an object', function () {
            return provider.getItem(TABLE_NAME, 'someRandomString').should.be.rejected
        })

        it('should call .get', async function() {
            await provider.getItem(TABLE_NAME, KEYS)
            assert(provider.docClient.get.calledOnce)
        })

        it('should call .get with correct tableName', async function() {
            await provider.getItem(TABLE_NAME, KEYS)
            assert(provider.docClient.get.getCall(0).args[0].TableName, TABLE_NAME)
        })

        it('should call .get with correct keys', async function() {
            await provider.getItem(TABLE_NAME, KEYS)
            assert(provider.docClient.get.getCall(0).args[0].Key, KEYS)
        })
    })

    describe('updateItem', function() {
        const TABLE_NAME = 'tableName'
        const KEYS = { a: 1 }

        beforeEach(function () {
            sinon.spy(provider.docClient, 'update')
        })

		afterEach(function () {
			provider.docClient.update.restore()
        })

        it('should reject the promise if given invalid tableName', function () {
            return provider.updateItem(undefined, {}).should.be.rejected
        })

        it('should reject if keys is not an object', function () {
            return provider.updateItem(TABLE_NAME, 'someRandomString').should.be.rejected
        })

        it('should reject if updateObject is not an object', function () {
            return provider.updateItem(TABLE_NAME, { a: 1 }, 'someRandomString').should.be.rejected
        })

        it('should call .update', async function() {
            await provider.updateItem(TABLE_NAME, KEYS, {})
            assert(provider.docClient.update.calledOnce)
        })

        it('should call .update with correct tableName', async function() {
            await provider.updateItem(TABLE_NAME, KEYS, {})
            assert(provider.docClient.update.getCall(0).args[0].TableName, TABLE_NAME)
        })

        it('should call .update with correct keys', async function() {
            await provider.updateItem(TABLE_NAME, KEYS, {})
            assert(provider.docClient.update.getCall(0).args[0].Key, KEYS)
        })

        it('should include updateObject expressions in params', async function () {
            await provider.updateItem(TABLE_NAME, { a: 1 }, {
                UpdateExpression: 'someUpdateExpression',
                ConditionExpression: 'someConditionExpression',
                ExpressionAttributeValues: 'someExpressionAttributeValues',
                ReturnValues: 'someReturnValue'
            })
            assert(provider.docClient.update.getCall(0).args[0].UpdateExpression, 'someUpdateExpression')
            assert(provider.docClient.update.getCall(0).args[0].ConditionExpression, 'someConditionExpression')
            assert(provider.docClient.update.getCall(0).args[0].ExpressionAttributeValues, 'someExpressionAttributeValues')
            assert(provider.docClient.update.getCall(0).args[0].ReturnValues, 'someReturnValue')
        })
    })

    describe('deleteItem', function() {
        const TABLE_NAME = 'tableName'
        const KEYS = { a: 1 }

        beforeEach(function () {
            sinon.spy(provider.docClient, 'delete')
        })

		afterEach(function () {
			provider.docClient.delete.restore()
        })

        it('should reject the promise if given invalid tableName', function () {
            return provider.deleteItem(undefined, {}).should.be.rejected
        })

        it('should reject if keys is not an object', function () {
            return provider.deleteItem(TABLE_NAME, 'someRandomString').should.be.rejected
        })

        it('should call .delete with correct tableName', async function() {
            await provider.deleteItem(TABLE_NAME, KEYS, {})
            assert(provider.docClient.delete.getCall(0).args[0].TableName, TABLE_NAME)
        })

        it('should call .delete with correct keys', async function() {
            await provider.deleteItem(TABLE_NAME, KEYS, {})
            assert(provider.docClient.delete.getCall(0).args[0].Key, KEYS)
        })

        it('should include updateObject expressions in params', async function () {
            await provider.deleteItem(TABLE_NAME, { a: 1 }, {
                ConditionExpression: 'someConditionExpression',
                ExpressionAttributeValues: 'someExpressionAttributeValues'
            })
            assert(provider.docClient.delete.getCall(0).args[0].ConditionExpression, 'someConditionExpression')
            assert(provider.docClient.delete.getCall(0).args[0].ExpressionAttributeValues, 'someExpressionAttributeValues')
        })
    })

    describe('query', function() {
        const TABLE_NAME = 'tableName'

        beforeEach(function () {
            sinon.spy(provider.docClient, 'query')
        })

		afterEach(function () {
			provider.docClient.query.restore()
        })

        it('should reject the promise if given invalid tableName', function () {
            return provider.query(undefined, {}).should.be.rejected
        })

        it('should reject if queryObject is not an object', function () {
            return provider.query(TABLE_NAME, 'someRandomString').should.be.rejected
        })

        it('should call .query with correct tableName', async function() {
            await provider.query(TABLE_NAME, {})
            assert(provider.docClient.query.getCall(0).args[0].TableName, TABLE_NAME)
        })

        it('should include updateObject expressions in params', async function () {
            await provider.query(TABLE_NAME, {
                KeyConditionExpression: 'someKeyConditionExpression',
                ExpressionAttributeValues: 'someExpressionAttributeValues',
                ExpressionAttributeNames: 'someExpressionAttributeNames'
            })
            assert(provider.docClient.query.getCall(0).args[0].KeyConditionExpression, 'someKeyConditionExpression')
            assert(provider.docClient.query.getCall(0).args[0].ExpressionAttributeValues, 'someExpressionAttributeValues')
            assert(provider.docClient.query.getCall(0).args[0].ExpressionAttributeNames, 'someExpressionAttributeNames')
        })

        it('should only include valid updateObject expressions in params', async function () {
            await provider.query(TABLE_NAME, {
                InvalidExpressionOptions: 'InvalidExpressionOption',
                KeyConditionExpression: 'someKeyConditionExpression',
                ExpressionAttributeValues: 'someExpressionAttributeValues',
                ExpressionAttributeNames: 'someExpressionAttributeNames'
            })
            assert(provider.docClient.query.getCall(0).args[0].KeyConditionExpression, 'someKeyConditionExpression')
            assert(provider.docClient.query.getCall(0).args[0].ExpressionAttributeValues, 'someExpressionAttributeValues')
            assert(provider.docClient.query.getCall(0).args[0].ExpressionAttributeNames, 'someExpressionAttributeNames')
            expect(provider.docClient.query.getCall(0).args[0].InvalidExpressionOptions).to.equal(undefined)
        })
    })

    describe('scan', function() {
        const TABLE_NAME = 'tableName'

        beforeEach(function () {
            sinon.spy(provider.docClient, 'scan')
        })

		afterEach(function () {
			provider.docClient.scan.restore()
        })

        it('should reject the promise if given invalid tableName', function () {
            return provider.scan(undefined, {}).should.be.rejected
        })

        it('should reject if scanObject is not an object', function () {
            return provider.scan(TABLE_NAME, 'someRandomString').should.be.rejected
        })

        it('should call .scan with correct tableName', async function() {
            await provider.scan(TABLE_NAME, {})
            assert(provider.docClient.scan.getCall(0).args[0].TableName, TABLE_NAME)
        })

        it('should include updateObject expressions in params', async function () {
            await provider.scan(TABLE_NAME, {
                ProjectionExpression: 'someProjectionExpression',
                FilterExpression: 'someFilterExpression'
            })
            assert(provider.docClient.scan.getCall(0).args[0].ProjectionExpression, 'someProjectionExpression')
            assert(provider.docClient.scan.getCall(0).args[0].FilterExpression, 'someFilterExpression')
        })
    })

    describe('updateItemSimple', function () {
        const TABLE_NAME = 'tableName'
        const KEYS = { a: 1 }

        beforeEach(function () {
            sinon.spy(provider.docClient, 'update')
        })

		afterEach(function () {
			provider.docClient.update.restore()
        })

        it('should reject the promise if given invalid tableName', function () {
            return provider.updateItemSimple(undefined, {}).should.be.rejected
        })

        it('should reject if keys is not an object', function () {
            return provider.updateItemSimple(TABLE_NAME, 'someRandomString').should.be.rejected
        })

        it('should reject if updateObject is not an object', function () {
            return provider.updateItemSimple(TABLE_NAME, { a: 1 }, 'someRandomString').should.be.rejected
        })

        it('should call .update', async function() {
            await provider.updateItemSimple(TABLE_NAME, KEYS, {})
            assert(provider.docClient.update.calledOnce)
        })

        it('should call .update with correct tableName', async function() {
            await provider.updateItemSimple(TABLE_NAME, KEYS, {})
            assert(provider.docClient.update.getCall(0).args[0].TableName, TABLE_NAME)
        })

        it('should call .update with correct keys', async function() {
            await provider.updateItemSimple(TABLE_NAME, KEYS, {})
            assert(provider.docClient.update.getCall(0).args[0].Key, KEYS)
        })

        it('should generate valid expressions', async function () {
            await provider.updateItemSimple(TABLE_NAME, KEYS, JSON.parse("{\"lastUpdated\":1563643252459,\"losses\":4,\"ranking\":1141.4902160935137,\"streak\":-4,\"wins\":0,\"name\":\"vidar olsnes\"}"))
            updateExpressionIsCorrect = provider.docClient.update.getCall(0).args[0].UpdateExpression === 'set a = :0, b.c = :1'
            attributeValuesIsCorrect = provider.docClient.update.getCall(0).args[0].ExpressionAttributeValues[':0'] === 2
            assert(updateExpressionIsCorrect && attributeValuesIsCorrect)
        })

    })
})