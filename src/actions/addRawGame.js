const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const createResponse = require('../utils/createResponse')
const uuid = require('uuid/v1')

const handler = async function (e, context) {
	console.log('EVENT: \n', JSON.stringify(e))
	if(context)
		context.callbackWaitsForEmptyEventLoop = false

	if (e && e.body)
		var data = JSON.parse(e.body)
	else
		var data = e

    data.id = uuid()    
    await db.addGame(data)
    return createResponse('Successfully added game')
}

module.exports.handler = handler