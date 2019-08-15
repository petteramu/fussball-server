const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const createResponse = require('../utils/createResponse')
const _ = require('lodash')

const handler = async function (e, context) {
    if(context)
        context.callbackWaitsForEmptyEventLoop = false
    
    let tournaments = await db.getTournamentsOverview()
    return createResponse(tournaments)
}

module.exports.handler = handler