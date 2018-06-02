db = require '../database'
calculateGame = require '../utils/calculateGame'

# Calculate and add the game result to the database
# @param [Object] game
# @param [Function] cb
addGame = (game, cb) ->
	game.winner = game.winner.toLowerCase()
	game.loser  = game.loser.toLowerCase()
	{ newGame, newWinnerElo, newLoserElo } = calculateGame(game)

	promises = []
	promises.push db.addGame(newGame)
	promises.push updateWinner(game.winner, newWinnerElo)
	promises.push updateLoser(game.loser, newLoserElo)

	Promise.all(promises).then((result) ->
		cb?(null, "Successfully added game")
	).catch((err) ->
		cb?(err)
	)

# Updates a loser player. Will set the new rating, reset the streak and increment losses
# @param [String] key
# @param [Numerical] rating
updateLoser = (key, rating) ->
	player = db.getPlayer(key)
	player.lastUpdated = new Date().getTime()
	player.ranking = rating

	player.streak ?= 0
	if player.streak > 0
		player.streak = -1
	else
		player.streak--

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
	if player.streak < 0
		player.streak = 1
	else
		player.streak++

	player.wins ?= 0
	player.wins++
	db.updatePlayer(key, player)

module.exports = addGame
