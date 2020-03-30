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
            await mergePlayedMatches(tournament)
            calculateStandings(tournament)
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

function calculateStandings(tournament) {
    for(let i = 0; i < tournament.players.length; i++) {
        const player = tournament.players[i]
        let matches = _.flatten(tournament.matches).filter((match) => match.white.key === player || match.black.key === player)
        let wins = matches.filter((match) => {
            let playerColor = (match.white.key === player) ? 'white' : 'black'
            return match.winner === playerColor
        }).length
        let losses = matches.filter((match) => {
            let playerColor = (match.white.key === player) ? 'white' : 'black'
            return match.winner && match.winner !== playerColor && match.winner !== 'remis'
        }).length
        let remis = matches.filter(match => match.winner === 'remis').length
        let points = (wins + remis / 2)
        const standingObject = {
            name: player,
            wins,
            losses,
            remis,
            points
        }
        tournament.players[i] = standingObject
    }
}

async function mergePlayedMatches(tournament) {
    const matchIds = tournament.matches.map(match => match.id)
    let playedMatches = await db.getGamesById(matchIds)
    let rounds = []

    // Insert data from the played matches into the scheduled matches from the tournament table
    for(let i = 0; i < tournament.matches.length; i++) {
        let match = tournament.matches[i]
        let playedMatch = _.find(playedMatches, played => played.id === match.id)
        
        // Define round if not already existing
        let roundNumber = match.round - 1 //To start off at index 0
        if(rounds[roundNumber] == undefined) {
            rounds[roundNumber] = []
        }
        let round = rounds[roundNumber]

        if(playedMatch)
            round.push(playedMatch)
        else {
            // Standardize matches' player structure
            match.white = { key: tournament.matches[i].white }
            match.black = { key: tournament.matches[i].black }
            round.push(match)
        }
    }
    // Replace tournament.matches since we don't want them in the response
    tournament.matches = rounds
    return tournament
}

module.exports.handler = handler