const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const createResponse = require('../utils/createResponse')
const _ = require('lodash')

const handler = async function (e, context, callback) {
    if(context)
        context.callbackWaitsForEmptyEventLoop = false

    let games = await db.getGames()
    games = _.sortBy(games, ['timestamp']).reverse()
    return createResponse(games)
}

module.exports.handler = handler