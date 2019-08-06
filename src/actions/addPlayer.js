const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const createResponse = require('../utils/createResponse')
const _ = require('lodash')

const handler = async function(e, context) {
	console.log('EVENT: \n', JSON.stringify(e))
	if(context)
		context.callbackWaitsForEmptyEventLoop = false
	
	if (e && e.body)
		var data = JSON.parse(e.body)
	else
		var data = e

	if(!data.name) {
		throw new TypeError('First argument must contain a name')
	}
	await addPlayer(data.name)
	return createResponse({ message: "Successfully added player"})
}

const addPlayer = async function (name) {
	_validateName(name)

	name = name.toLowerCase()

	// Don't add player if it already exists
	existing = await db.getPlayer(name)
	if (existing) {
		console.log(existing)
		throw new Error("Player already exists")
	}

	let player = {
		ranking: 1200,
		streak: 0,
		wins: 0,
		losses: 0,
		peak: 1200
	}

	await db.updatePlayer(name, player)
	return true
}

// Validates a players name
// Will decline if it is undefined or an empty string
const _validateName = function (name) {
	if(!name || name.length === 0)
		throw new Error("Player name cannot be empty")
}

exports.handler = handler