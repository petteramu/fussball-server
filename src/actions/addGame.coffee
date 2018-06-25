db = require '../database'
calculateGame = require '../utils/calculateGame'

# Calculate and add the game result to the database
# @param [Object] game
# @param [Function] cb
addGame = (game, cb) ->
	game.white = game.white.toLowerCase()
	game.black  = game.black.toLowerCase()

	{ newGame, newWhiteElo, newBlackElo } = calculateGame(game)

	promises = []
	promises.push db.addGame(newGame)
	if game.winner is 'white'
		promises.push updateWinner(game.white, newWhiteElo)
		promises.push updateLoser(game.black, newBlackElo)
	else if game.winner is 'black'
		promises.push updateWinner(game.black, newBlackElo)
		promises.push updateLoser(game.white, newWhiteElo)
	else
		promises.push updateRemis(game.white, newWhiteElo)
		promises.push updateRemis(game.black, newBlackElo)

	Promise.all(promises).then((result) ->
		cb?(null, "Successfully added game")
	).catch((err) ->
		cb?(err)
	)


# Updates a player in remis game. Will set the new rating and reset the streak
# @param [String] key
# @param [Numerical] rating
updateRemis = (key, rating) ->
	player = db.getPlayer(key)
	player.lastUpdated = new Date().getTime()
	player.ranking = rating

	player.streak ?= 0
	player.remis ?= 0
	player.remis++
	db.updatePlayer(key, player)

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
