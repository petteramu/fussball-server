const _ = require('lodash')
const AWS = require('aws-sdk')
const MockDDB = require('../test/database/MockDDB')
const REGION = process.env.AWS_REGION
const ENDPOINT = process.env.DDB_ENDPOINT
const { QUERY_OPTIONS } = require('./DynamoDBProviderEnums')

class DynamoDBProviderFactory {
    getInstance () {
        if(this.instance)
            return this.instance
        
        let instance = new DynamoDBProvider()
        instance.setup()
        this.instance = instance
        return instance
    }

    getTestInstance () {
        if(this.instance)
            return this.instance
        
        let instance = new DynamoDBProvider()
        instance.setupForTest()
        this.instance = instance
        return instance
    }
}

class DynamoDBProvider {

    setupForTest () {
        this.docClient = new MockDDB()
    }

    setup() {
        AWS.config.update({
            region: REGION,
            endpoint: ENDPOINT
        })
        this.docClient = new AWS.DynamoDB.DocumentClient()
    }

    // Create an Database Item in the given table
    // @param [String] tableName
    // @param [Object] item
    // @return Promise
    createItem (tableName, item) {
        if(typeof tableName !== 'string')
            return Promise.reject('First argument needs to be a string', tableName)
        
        if(typeof item !== 'object')
            return Promise.reject('Second argument needs to be an object', item)

        let params = {
            TableName: tableName,
            Item: item
        }

        return this.docClient.put(params).promise()
    }

    // Batches get calls to fetch multiple items from multiple tables in a single
    // request.
    // @param [Object] RequestItems
    // @return Promise
    async batchGet (tables) {
        if(typeof tables !== 'object') {
            console.log(tables)
            throw new Error("batchGet called with invalid parameters")
        }
        console.log(tables)
        const RequestItems = _.mapValues(tables, (Keys) => { return { Keys } })
        console.log(RequestItems)
        const params = { RequestItems }
        console.log(params)
        let result = await this.docClient.batchGet(params).promise()

        if(result === undefined || result === null || result.Responses === undefined || result.Responses === null)
            return
        
        return result.Responses
    }

    // Get an Item from the database
    // @param [String] tableName The name of the table to get the item from
    // @param [Object] keys The keys of the item to get
    // @return Promise
    async getItem (tableName, keys) {
        if(typeof tableName !== 'string')
            return Promise.reject('First argument needs to be a string')
        
        if(typeof keys !== 'object')
            return Promise.reject('Second argument needs to be an object')
        
        let params = {
            TableName: tableName,
            Key: keys
        }

        let result = await this.docClient.get(params).promise()

        if(result === undefined || result === null || result.Item === undefined || result.Item === null)
            return

        return result.Item
    }

    // Update an Database Item in the given table
    // Only accepts an object which defines which params should be updated
    // @param [String] tableName
    // @param [Object] keys
    // @param [Object] updateObject
    // @return Promise
    updateItemSimple (tableName, keys, updateObject) {
        if(typeof tableName !== 'string')
            return Promise.reject('First argument needs to be a string')
        
        if(typeof keys !== 'object')
            return Promise.reject('Second argument needs to be an object')
        
        if(typeof updateObject !== 'object')
            return Promise.reject('Third argument needs to be an object')

        try {     
            var generatedExpression = this._createUpdateExpression(updateObject)
        }
        catch (e) {
            return Promise.reject(e)
        }
        let params = {
            TableName: tableName,
            Key: keys,
            UpdateExpression: generatedExpression.UpdateExpression,
            ExpressionAttributeValues: generatedExpression.ExpressionAttributeValues,
            ReturnValues: 'UPDATED_NEW'
        }
        return this.docClient.update(params).promise()
    }
    
    // Update an Database Item in the given table
    // @param [String] tableName
    // @param [Object] keys
    // @param [Object] updateObject Should contain all DDB update expression rules as keys such as 
    // UpdateExpression, ConditionExpression, ExpressionAttributeValues, ReturnValues, etc. These will
    // be used directly
    // @return Promise
    updateItem (tableName, keys, updateObject) {
        if(typeof tableName !== 'string')
            return Promise.reject('First argument needs to be a string')
        
        if(typeof keys !== 'object')
            return Promise.reject('Second argument needs to be an object')
        
        if(typeof updateObject !== 'object')
            return Promise.reject('Third argument needs to be an object')
        
        let params = {
            TableName: tableName,
            Key: keys
        }
        
        if (updateObject.UpdateExpression)
            params.UpdateExpression = updateObject.UpdateExpression
        
        if (updateObject.ConditionExpression)
            params.ConditionExpression = updateObject.ConditionExpression
        
        if (updateObject.ExpressionAttributeValues)
            params.ExpressionAttributeValues = updateObject.ExpressionAttributeValues
        
        params.ReturnValues = (updateObject.ReturnValues) ? updateObject.ReturnValues : 'UPDATED_NEW'

        return this.docClient.update(params).promise()
    }
    // Delets an Database Item in the given table
    // @param [String] tableName
    // @param [Object] keys
    // @param [Object] updateObject Should contain all DDB update expression rules as keys such as 
    // ConditionExpression, ExpressionAttributeValues, etc. These will be used directly
    // @return Promise
    deleteItem (tableName, keys, updateObject) {
        if(typeof tableName !== 'string')
            return Promise.reject('First argument needs to be a string')
        
        if(typeof keys !== 'object')
            return Promise.reject('Second argument needs to be an object')

        let params = {
            TableName: tableName,
            Key: keys
        }

        if (updateObject && updateObject.ConditionExpression)
            params.ConditionExpression = updateObject.ConditionExpression
        
        if (updateObject && updateObject.ExpressionAttributeValues)
            params.ExpressionAttributeValues = updateObject.ExpressionAttributeValues

        this.docClient.delete(params).promise()
    }
    
    // Queries a Database table for Items matching the given query conditions
    // @param [String] tableName
    // @param [Object] keys
    // @param [Object] queryObject Should contain all DDB update expression rules as keys such as 
    // KeyConditionExpression, ExpressionAttributeValues, ExpressionAttributeNames, etc. These will be used directly
    // @return Promise
    async query (tableName, queryObject) {
        if(typeof tableName !== 'string')
            return Promise.reject('First argument needs to be a string')
        
        if(typeof queryObject !== 'object')
            return Promise.reject('Second argument needs to be an object')
        
        let params = {
            TableName: tableName
        }

        Object.keys(queryObject).forEach((key) => {
            if (Object.values(QUERY_OPTIONS).indexOf(key) > -1)
                params[key] = queryObject[key]
        })

        let result = await this.docClient.query(params).promise()
        if(result && _.isArray(result.Items))
            return result.Items

        return
    }
    
    // Scans a Database table
    // @param [String] tableName
    // @param [Object] keys
    // @param [Object] queryObject Should contain all DDB update expression rules as keys such as 
    // ProjectionExpression, FilterExpression, ExpressionAttributeValues, ExpressionAttributeNames, etc. These will be used directly
    // @return Promise
    async scan (tableName, scanObject) {
        if(typeof tableName !== 'string')
            return Promise.reject('First argument needs to be a string')
        
        if(typeof scanObject !== 'object')
            return Promise.reject('Second argument needs to be an object')
        
        let params = {
            TableName: tableName
        }

        if (scanObject && scanObject.ProjectionExpression)
            params.ProjectionExpression = scanObject.ProjectionExpression
        
        if (scanObject && scanObject.FilterExpression)
            params.FilterExpression = scanObject.FilterExpression
        
        if (scanObject && scanObject.ExpressionAttributeValues)
            params.ExpressionAttributeValues = scanObject.ExpressionAttributeValues

        let result = await this.docClient.scan(params).promise()
        if(result && _.isArray(result.Items))
            return result.Items
        
        return
    }

    _createUpdateExpression (object) {
        let updateExpressionObject = {}
        let attributeValues = {}
        let nextAttrKey = 0

        let seenObjects = [] // List of seen objects used to detect for cyclic references
        let recurse = (path, source) => {
            if (seenObjects.indexOf(source) > -1) {
                throw new Error(`Cyclic reference in object ${source}`)
            }
            if(source && typeof source === 'object')
                seenObjects.push(source)

            if (typeof source !== 'object' || source instanceof Array) {
                updateExpressionObject[path] = `:${nextAttrKey}`
                attributeValues[`:${nextAttrKey}`] = source
                nextAttrKey++
            }
            else {
                for(let key in source) {
                    let value = source[key]
                    if(path === '')
                        recurse(`${key}`, value)
                    else
                        recurse(`${path}.${key}`, value)
                }
            }
        }
        
        recurse('', object)
        let updateExpression = this._convertUpdateExpressionObjToExpression(updateExpressionObject)
        return {
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: attributeValues
        }
    }

    _convertUpdateExpressionObjToExpression (object) {
        let str = undefined
        for(let key in object) {
            let value = object[key]
            if(str === undefined)
                str = `set ${key} = ${value}`
            else
                str += `, ${key} = ${value}`
        }
        return str
    }
}
module.exports = new DynamoDBProviderFactory()