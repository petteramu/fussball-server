db = require '../database'
calculateGame = require '../utils/calculateGame'

# Calculate and add the game result to the database
# @param [Object] game
# @param [Function] cb
addGame = (game, cb) ->
	{ newGame, newWinner1Elo, newWinner2Elo, newLoser1Elo, newLoser2Elo } = calculateGame(game)

	console.log newGame

	console.log("preparing to add game")
	try
		db.addGame(newGame)
		.then((result) ->
			console.log("added game, updating players")
			promises = []
			promises.push updateWinner(game.winner1, newWinner1Elo)
			promises.push updateWinner(game.winner2, newWinner2Elo)
			promises.push updateLoser(game.loser1, newLoser1Elo)
			promises.push updateLoser(game.loser2, newLoser2Elo)

			Promise.all(promises).then((result) ->
				cb?(null, "Successfully added game")
			).catch((err) ->
				cb?(err)
			)
		).catch((err) ->
			cb?(err)
		)
	catch err
		cb?(err)

# Updates a loser player. Will set the new rating, reset the streak and increment losses
# @param [String] key
# @param [Numerical] rating
updateLoser = (key, rating) ->
	player = db.getPlayer(key)
	player.lastUpdated = new Date().getTime()
	player.ranking = rating
	player.streak = 0
	player.losses ?= 0
	player.losses++
	db.updatePlayer(key, player)

# Updates a winner player. Will set the new rating, increment the streak and increment wins
# @param [String] key
# @param [Numerical] rating
updateWinner = (key, rating) ->
	player = db.getPlayer(key)
	player.lastUpdated = new Date().getTime()
	player.ranking = rating
	player.streak ?= 0
	player.streak++
	player.wins ?= 0
	player.wins++
	db.updatePlayer(key, player)

module.exports = addGame
