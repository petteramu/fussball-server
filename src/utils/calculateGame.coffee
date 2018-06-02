db = require '../database'

DEFAULT_KFACTOR = process.env.kfactor || 32

# Calculates a game and the resulting change in rating for the given set of players
# @param [Object]
# @return [Object]
calculateGame = (game) ->
	_validateGame(game)

	winnerRating = getRating(game.winner)
	loserRating = getRating(game.loser)

	{ winnerProbability, loserProbability } = getPlayerProbability(winnerRating, loserRating)

	newWinnerElo = getNewRating(winnerRating, 1, winnerProbability)
	winnerGain = newWinnerElo - winnerRating

	newLoserElo = getNewRating(loserRating, 0, loserProbability)
	loserLoss = loserRating - newLoserElo

	timestamp = new Date().getTime()

	newGame =
		timestamp: timestamp
		winners: [
			{
				key: game.winner
				gain: winnerGain
				preRanking: winnerRating
			}
		]
		losers: [
			{
				key: game.loser
				loss: loserLoss
				preRanking: loserRating
			}
		]

	return { newGame, newWinnerElo, newLoserElo }

# Returns the probability of each of the players winning the game given
# @param [Numerical] winnerRating
# @param [Numerical] winner2Rating
# @param [Numerical] loser1Rating
# @param [Numerical] loser2Rating
# @return [Object] Object containing the probabilities
getPlayerProbability = (winnerRating, loserRating) ->
	winnerProbability = getProbability(loserRating, winnerRating)
	loserProbability = getProbability(winnerRating, loserRating)

	return { winnerProbability, loserProbability }

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
			newK = DEFAULT_KFACTOR * 1.09
		when 2
			newK = DEFAULT_KFACTOR * 1.13
		when 3
			newK = DEFAULT_KFACTOR * 1.19
		when 4
			newK = DEFAULT_KFACTOR * 1.27
		when 5
			newK = DEFAULT_KFACTOR * 1.37
		when 6
			newK = DEFAULT_KFACTOR * 1.52
		when 7
			newK = DEFAULT_KFACTOR * 1.73
		when 8
			newK = DEFAULT_KFACTOR * 2.02
		when 9
			newK = DEFAULT_KFACTOR * 2.43
		when 10
			newK = DEFAULT_KFACTOR * 3

	return newK

# Validates the object given to addGame
# Makes sure it contains the correct properties
# @param [Object] data
_validateGame = (data) ->
	unless data.winner? and data.loser?
		throw new Error("Missing player data in game object")

	unless db.getPlayer(data.winner)? and db.getPlayer(data.loser)?
		throw new Error("One or more players does not exist")

module.exports = calculateGame
