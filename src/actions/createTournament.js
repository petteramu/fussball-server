const createResponse = require('../utils/createResponse')
const createSchedule = require('../utils/roundRobin')
const db = require('../database/DynamoDBRepository').getInstance()
const uuid = require('uuid/v4')

const handler = async function (e, context) {
    console.log('Event: \n', JSON.stringify(e))
    if(context)
        context.callbackWaitsForEmptyEventLoop = false
    
    if(e == undefined || e.body == undefined) {
        throw new Error("Faulty input received in createTournament")
    }

    var data = JSON.parse(e.body)

    return await createTournament(data)
}

async function createTournament (tournamentData) {
    try {
        await _validateTournament(tournamentData)
        var players = await _getPlayerObjects(tournamentData.players)
    }
    catch(e) {
        return createResponse(e.toString(), 502)
    }

    let matches = await createSchedule(players, tournamentData.options.double, true)
    let tournamentObject = {
        id: uuid(),
        tournamentName: tournamentData.name,
        players: tournamentData.players,
        created: new Date().getTime(),
        matches,
        options: {
            double: tournamentData.options.double
        }
    }
    await db.addTournament(tournamentObject)
    return createResponse({ id: tournamentObject.id, name: tournamentObject.tournamentName })
}

async function _validateTournament(data) {
    if(data == undefined) throw new Error("Tournament data object missing")
    if(data.name == undefined) throw new Error("Tournament name missing")
    if(data.players == undefined || !Array.isArray(data.players))
        throw new Error("Players must be an array")

    if(!data.options || typeof data.options.double !== "boolean")
        throw new Error("Options.double must be a boolean")
    
    return true
}

async function _getPlayerObjects(playersNames) {
    let players = []
    for(let playerName of playersNames) {
        try {
            let playerObj = await db.getPlayer(playerName)
            players.push(playerObj)
        }
        catch(e) {
            throw new Error(`Players ${playerName} does not exist`)
        }
    }
    return players
}

module.exports.handler = handler