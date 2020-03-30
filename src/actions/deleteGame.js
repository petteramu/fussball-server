const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const createResponse = require('../utils/createResponse')

const handler = async function (e, context) {
    console.log('EVENT: \n', JSON.stringify(e))

    if(context)
        context.callbackWaitsForEmptyEventLoop = false

    if(e && e.pathParameters)
        var data = e.pathParameters
    else
        var data = e

    let id = data.id
    try {
        let game = await db.getGame(id)
        if(!game) return createResponse(null)
        await rollbackGame(game)
        return createResponse(null)
    }
    catch(e) {
        return createResponse(e, 502)
    }
}

async function rollbackGame(game) {
    if(game == undefined) throw new Error("No game given to rollbackGame")

    let whitePlayer = await db.getPlayer(game.white.key)
    let blackPlayer = await db.getPlayer(game.black.key)

    var newWhiteRanking = whitePlayer.ranking - game.white.change
    var newBlackRanking = blackPlayer.ranking - game.black.change

    let white = { ranking: newWhiteRanking }
    let black = { ranking: newBlackRanking }
    await db.updatePlayer(game.white.key, white)
    await db.updatePlayer(game.black.key, black)
    await db.removeGame(game.id)
}

module.exports = {
    handler,
    rollbackGame
}