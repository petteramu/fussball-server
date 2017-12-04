db = require '../database'

DEFAULT_KFACTOR = process.env.kfactor || 32

# Calculates a game and the resulting change in rating for the given set of players
# @param [Object]
# @return [Object]
calculateGame = (game) ->
	_validateGame(game)

	winner1Rating = getRating(game.winner1)
	winner2Rating = getRating(game.winner2)
	loser1Rating = getRating(game.loser1)
	loser2Rating = getRating(game.loser2)

	{ winner1Probability, winner2Probability, loser1Probability, loser2Probability } = getPlayerProbability(winner1Rating, winner2Rating, loser1Rating, loser2Rating)

	newWinner1Elo = getNewRating(winner1Rating, 1, winner1Probability, game.difference)
	winner1Gain = newWinner1Elo - winner1Rating

	newWinner2Elo = getNewRating(winner2Rating, 1, winner2Probability, game.difference)
	winner2Gain = newWinner2Elo - winner2Rating

	newLoser1Elo = getNewRating(loser1Rating, 0, loser1Probability, game.difference)
	loser1Loss = loser1Rating - newLoser1Elo

	newLoser2Elo = getNewRating(loser2Rating, 0, loser2Probability, game.difference)
	loser2Loss = loser2Rating - newLoser2Elo

	timestamp = new Date().getTime()

	newGame =
		timestamp: timestamp
		difference: game.difference
		winners: [
			{
				key: game.winner1
				gain: winner1Gain
			}
			{
				key: game.winner2
				gain: winner2Gain
			}
		]
		losers: [
			{
				key: game.loser1
				loss: loser1Loss
			}
			{
				key: game.loser2
				loss: loser2Loss
			}
		]

	return { newGame, newWinner1Elo, newWinner2Elo, newLoser1Elo, newLoser2Elo }

# Returns the probability of each of the players winning the game given
# @param [Numerical] winner1Rating
# @param [Numerical] winner2Rating
# @param [Numerical] loser1Rating
# @param [Numerical] loser2Rating
# @return [Object] Object containing the probabilities
getPlayerProbability = (winner1Rating, winner2Rating, loser1Rating, loser2Rating) ->
	losersAvg = averageRating(loser1Rating, loser2Rating)
	winnersAvg = averageRating(winner1Rating, winner2Rating)

	winnersProbability = getProbability(losersAvg, winnersAvg)
	losersProbability = getProbability(winnersAvg, losersAvg)

	winner1Probability = getProbability(losersAvg, winner1Rating)
	winner1Probability = (winnersProbability + winner1Probability) / 2

	winner2Probability = getProbability(losersAvg, winner2Rating)
	winner2Probability = (winnersProbability + winner2Probability) / 2

	loser1Probability = getProbability(winnersAvg, loser1Rating)
	loser1Probability = (losersProbability + loser1Probability) / 2

	loser2Probability = getProbability(winnersAvg, loser2Rating)
	loser2Probability = (losersProbability + loser2Probability) / 2

	return { winner1Probability, winner2Probability, loser1Probability, loser2Probability }

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
getNewRating = (currentRating, result, probability, difference) ->
	return currentRating + (getKByDiff(difference) * (result - probability))

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
	unless data.winner1? and data.winner2? and data.loser1? and data.loser2?
		throw new Error("Missing player data in game object")

	unless db.getPlayer(data.winner1)? and db.getPlayer(data.loser2)? and db.getPlayer(data.loser1)? and db.getPlayer(data.loser2)?
		throw new Error("One or more players does not exist")

	unless data.difference?
		throw new Error("No score given")

	unless data.difference >= 0 and data.difference <= 10
		throw new Error("Difference must be from 0 to 10")

module.exports = calculateGame
