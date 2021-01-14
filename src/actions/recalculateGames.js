const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const calculateGame = require('../utils/calculateGame')
const createResponse = require('../utils/createResponse')
const _ = require('lodash')
const {
    updateStatsFromWin,
    updateStatsFromRemis,
    updateStatsFromLoss
} = require('../utils/stats')

const handler = async function (e, context) {
	console.log('EVENT: \n', JSON.stringify(e))
	if(context)
		context.callbackWaitsForEmptyEventLoop = false

    let games = await db.getGames()
    games = _.sortBy(games, 'timestamp')
    console.log("Recalculating " + games.length + " games")
    try {
        const result = await recalculateGames(games)
        console.log(result.games)
        console.log(result.rankings)
        let promises = result.games.map(game => db.addGame(game))
        await Promise.all(promises)
        let userPromises = Object.entries(result.rankings).map(([key, value]) => db.updatePlayer(key, value))
        await Promise.all(userPromises)
        return createResponse("Successfully recalculated games")
    }
    catch(error) {
        return createResponse("Interal error: " + error.message, 500)
    }
}

// Steps:
// 1. Create a map where the keys are each player and the values their new rating. Start everyone at 1200
// 2. Start at the first game, then recalculate that game using the ratings from the local map.
//    Overwrite the game in the db with the new values.
// 3. For each game recalculated, update the local map with the new rating.
// 4. When all games are recalculated, update the ranking table with the new rating
async function recalculateGames(games) {
    const playerRankings = {}

    if(games === undefined || games == null || games.length === undefined) {
        return {
            games: [],
            playerRankings
        }
    }

    let recalculatedGames = []
    let i = 0;
    while(i < games.length) {
        const game = games[i]

        const white = game.white.key
        const black = game.black.key
        ensurePlayerRankExists(playerRankings, white)
        ensurePlayerRankExists(playerRankings, black)
        game.white.preRanking = playerRankings[white].ranking
        game.black.preRanking = playerRankings[black].ranking

        const { newGame, newWhiteElo, newBlackElo } = await calculateGame({
            white: game.white.key,
            black: game.black.key,
            winner: game.winner,
            id: game.id
        }, game)

        if (game.winner === 'white') {
            updateStatsFromWin(playerRankings[white], newWhiteElo)
            updateStatsFromLoss(playerRankings[black], newBlackElo)
        }
        else if (game.winner === 'black') {
            updateStatsFromWin(playerRankings[black], newBlackElo)
            updateStatsFromLoss(playerRankings[white], newWhiteElo)
        }
        else {
            updateStatsFromRemis(playerRankings[white], newWhiteElo)
            updateStatsFromRemis(playerRankings[black], newBlackElo)
        }

        recalculatedGames.push(newGame)
        i += 1
    }

    return {
        games: recalculatedGames,
        rankings: playerRankings
    }
}

function ensurePlayerRankExists(rankings, playerKey) {
    if(rankings[playerKey] === undefined) {
        rankings[playerKey] = {
            ranking: 1200,
            peak: 1200,
            streak: 0
        }
    }
}

module.exports = {
    handler,
    recalculateGames
}
