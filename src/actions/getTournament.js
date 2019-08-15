const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const createResponse = require('../utils/createResponse')
const _ = require('lodash')

const handler = async function (e, context) {
    console.log("Event \n", e)
    if(context)
        context.callbackWaitsForEmptyEventLoop = false
    
    if(!e || !e.queryStringParameters) {
        throw new Error("No valid data given to getTournament")
    }

    try {
        let { id } = e.queryStringParameters
        if(!id)
            throw new Error("No id given to getTournament")

        let tournament = await db.getTournament(id)
        if(tournament) {
            mergePlayedMatches(tournament)
            return createResponse(tournament)
        }
        else
            return createResponse("", 404)
    }
    catch(e) {
        console.log(e)
        return createResponse("Internal server error", 502)
    }
}

async function mergePlayedMatches(tournament) {
    for(let index in tournament.matches) {
        let tempMatch = tournament.matches[index]
        let match = await db.getGame(tempMatch.id)
        if(match) {
            match.round = tempMatch.round
            tournament.matches[index] = match
        }
    }
}

module.exports.handler = handler