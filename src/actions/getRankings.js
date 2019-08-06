const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const createResponse = require('../utils/createResponse')

const handler = async function (e, context) {
    if(context)
        context.callbackWaitsForEmptyEventLoop = false

    try {
        let result = await db.getRankings()
        return createResponse(result)
    }
    catch(e) {
        return createResponse(result)
    }
}

module.exports.handler = handler