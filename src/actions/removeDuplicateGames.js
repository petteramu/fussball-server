const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const createResponse = require('../utils/createResponse')
const _ = require('lodash')

const handler = async function (e, context) {
	console.log('EVENT: \n', JSON.stringify(e))
	if(context)
        context.callbackWaitsForEmptyEventLoop = false

    const games = await db.getGames()
    const keys = getDuplicateMatchKeys(games)
    console.log(keys)
    const promises = []
    keys.forEach(key => promises.push(db.removeGame(key)))
    try {
        await Promise.all(promises)
    }
    catch(error) {
        return createResponse('Could not remove all duplicate games. Reason: ' + error.message)
    }
    return createResponse('Successfully removed duplicate games')
}

function getDuplicateMatchKeys(games) {
	let grouped =_.groupBy(games, (game) => {
		return `${game.white.preRanking}-${game.white.change}-${game.white.key}-${game.black.preRanking}-${game.black.change}-${game.black.key}-${game.timestamp}`
	})
    const duplicate = _.filter(Object.values(grouped), (v) => v.length > 1)
    return duplicate.map(arr => arr[1].id)
}

module.exports.handler = handler