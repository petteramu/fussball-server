db = require '../database'

DEFAULT_KFACTOR = process.env.kfactor || 32

calculateChessGame = (game) ->
	_validateGame(game)

# Calculates a game and the resulting change in rating for the given set of players
# @param [Object]
# @return [Object]
calculateGame = (game) ->
	_validateGame(game)

	whiteRating = getRating(game.white)
	blackRating = getRating(game.black)

	{ whiteProbability, blackProbability } = getPlayerProbability(whiteRating, blackRating)

	newWhiteElo = getNewRating(whiteRating, getScoreForPlayer('white', game.winner), whiteProbability)
	whiteGain = if game.winner is 'white' then newWhiteElo - whiteRating else whiteRating - newWhiteElo

	newBlackElo = getNewRating(blackRating, getScoreForPlayer('black', game.winner), blackProbability)
	blackGain = if game.winner is 'black' then newBlackElo - blackRating else blackRating - newBlackElo

	timestamp = new Date().getTime()

	newGame =
		timestamp: timestamp
		winner: game.winner
		white:
			key: game.white
			gain: whiteGain
			preRanking: whiteRating
		black:
			key: game.black
			loss: blackGain
			preRanking: blackRating

	return { newGame, newWhiteElo, newBlackElo }

# Returns the score for the player.
# This is a value that could be 1 for a win, 0.5 for remis and 0 for a loss
getScoreForPlayer = (player, winner) ->
	return 1 if winner is player
	return 0.5 if winner.toLowerCase() is 'remis'
	return 0 # Loss

# Returns the probability of each of the players winning the game given
# @param [Numerical] whiteRating
# @param [Numerical] blackRating
# @return [Object] Object containing the probabilities
getPlayerProbability = (whiteRating, blackRating) ->
	whiteProbability = getProbability(blackRating, whiteRating)
	blackProbability = getProbability(whiteRating, blackRating)

	return { whiteProbability, blackProbability }

# Returns the probability that a player will win against another team
# @param [Numerical] opposingTeamAvg
# @param [Numerical] rating
# @return [Numerical]
getProbability = (opposingTeamAvg, rating) ->
	return 1 / (1 + Math.pow(10, (opposingTeamAvg - rating) / 400))

# Return the ranking of a player
# @param [String] key
getRating = (key) ->
	return db.getPlayer(key)?.ranking

# Returns the average of the given numbers
# @param [Numerical] player1
# @param [Numerical] player2
# @return [Numerical]
averageRating = (player1, player2) ->
	total = player1 + player2
	return total / 2

# Transforms a rating based on the given parameters
# @param [Numerical] currentRating
# @param [Numerical] result (0 for loss or 1 for win)
# @param [Numerical] probability
# @param [Numerical] difference The difference in goals
getNewRating = (currentRating, result, probability) ->
	return currentRating + (DEFAULT_KFACTOR * (result - probability))

# Returns a new K-factor based on the difference in the score of a game
# @param [Integer] difference
# @return [Numerical]
getKByDiff = (difference) ->
	switch (difference)
		when 1
			newK = DEFAULT_KFACTOR * 1
		when 2
			newK = DEFAULT_KFACTOR * 1.075
		when 3
			newK = DEFAULT_KFACTOR * 1.15
		when 4
			newK = DEFAULT_KFACTOR * 1.225
		when 5
			newK = DEFAULT_KFACTOR * 1.3

	return newK

# Validates the object given to addGame
# Makes sure it contains the correct properties
# @param [Object] data
_validateGame = (data) ->
	unless data.white? and data.black?
		throw new Error("Missing player data in game object")

	unless db.getPlayer(data.white)? and db.getPlayer(data.black)?
		throw new Error("One or more players does not exist")

	unless data.winner?
		throw new Error("No result submitted")

module.exports = calculateGame
