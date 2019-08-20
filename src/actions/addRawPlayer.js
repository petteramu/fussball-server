const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const createResponse = require('../utils/createResponse')
const uuid = require('uuid/v4')

const handler = async function (e, context) {
	console.log('EVENT: \n', JSON.stringify(e))
	if(context)
		context.callbackWaitsForEmptyEventLoop = false

	if (e && e.body)
		var data = JSON.parse(e.body)
	else
		var data = e

    let name = data.name
    delete data.name
    await db.updatePlayer(name, data)
    return createResponse('Successfully added player')
}

module.exports.handler = handler