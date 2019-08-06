const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const calculateGame = require('../utils/calculateGame')
const createResponse = require('../utils/createResponse')

const handler = async function (e, context) {
	console.log('EVENT: \n', JSON.stringify(e))
	if(context)
		context.callbackWaitsForEmptyEventLoop = false

	if (e && e.body)
		var data = e.body
	else
		var data = e

	return await addGame(JSON.parse(data))
}

// Calculate and add the game result to the database
// @param [Object] game
// @param [Function] cb
async function addGame (game) {
	if(game && game.white && game.white.toLowerCase)
		game.white = game.white.toLowerCase()
	if(game && game.black && game.black.toLowerCase)
		game.black  = game.black.toLowerCase()

	let { newGame, newWhiteElo, newBlackElo } = await calculateGame(game)

	let promises = []
	promises.push(db.addGame(newGame))
	if (game.winner === 'white') {
		promises.push(updateWinner(game.white, newWhiteElo))
		promises.push(updateLoser(game.black, newBlackElo))
	}
	else if (game.winner === 'black') {
		promises.push(updateWinner(game.black, newBlackElo))
		promises.push(updateLoser(game.white, newWhiteElo))
	}
	else {
		promises.push(updateRemis(game.white, newWhiteElo))
		promises.push(updateRemis(game.black, newBlackElo))
	}

	let result = await Promise.all(promises)
	return createResponse({
		message: "Successfully added game",
		id: result[0].key,
		game: newGame
	})
}

// Updates a player in remis game. Will set the new rating and reset the streak
// @param [String] key
// @param [Numerical] rating
async function updateRemis (key, rating) {
	let player = await db.getPlayer(key)
	player.lastUpdated = new Date().getTime()
	player.ranking = rating

	if(player.peak == undefined || rating > player.peak)
		player.peak = rating

	player.streak = (player.streak) ? player.streak : 0
	player.remis = (player.remis) ? player.remis : 0
	player.remis++
	delete player.name // Remove id as we cannot change that(would result in an error from ddb)
	return db.updatePlayer(key, player)
}

// Updates a loser player. Will set the new rating, reset the streak and increment losses
// @param [String] key
// @param [Numerical] rating
async function updateLoser (key, rating) {
	let player = await db.getPlayer(key)
	player.lastUpdated = new Date().getTime()
	player.ranking = rating

	player.streak = (player.streak) ? player.streak : 0
	if (player.streak > 0)
		player.streak = -1
	else
		player.streak--
	
	player.losses = (player.losses) ? player.losses : 0
	player.losses++
	delete player.name // Remove id as we cannot change that(would result in an error from ddb)
	return db.updatePlayer(key, player)
}
// Updates a winner player. Will set the new rating, increment the streak and increment wins
// @param [String] key
// @param [Numerical] rating
async function updateWinner (key, rating) {
	let player = await db.getPlayer(key)
	player.lastUpdated = new Date().getTime()
	player.ranking = rating

	if(player.peak == undefined || rating > player.peak)
		player.peak = rating

	player.streak = (player.streak) ? player.streak : 0
	if (player.streak < 0)
		player.streak = 1
	else
		player.streak++

	player.wins = (player.wins) ? player.wins : 0
	player.wins++
	delete player.name // Remove id as we cannot change that(would result in an error from ddb)
	return db.updatePlayer(key, player)
}

module.exports.handler = handler
