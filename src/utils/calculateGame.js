const db = require('../database/DynamoDBRepository').getInstance()
const _ = require('lodash')
const uuid = require('uuid/v1')

const DEFAULT_KFACTOR = process.env.kfactor || 32

// Calculates a game and the resulting change in rating for the given set of players
// @param [Object]
// @return [Object]
async function calculateGame (game) {
	console.log(game)
	await _validateGame(game)

	let whiteRating = await getRating(game.white)
	let blackRating = await getRating(game.black)

	let { whiteProbability, blackProbability } = getPlayerProbability(whiteRating, blackRating)

	let newWhiteElo = getNewRating(whiteRating, getScoreForPlayer('white', game.winner), whiteProbability)
	let whiteChange = newWhiteElo - whiteRating

	let newBlackElo = getNewRating(blackRating, getScoreForPlayer('black', game.winner), blackProbability)
	let blackChange = newBlackElo - blackRating

	let timestamp = new Date().getTime()

	let newGame = {
		id: uuid(),
		timestamp: timestamp,
		winner: game.winner,
		white: {
			key: game.white,
			change: whiteChange,
			preRanking: whiteRating
		},
		black: {
			key: game.black,
			change: blackChange,
			preRanking: blackRating
		}
	}

	return { newGame, newWhiteElo, newBlackElo }
}

// Returns the score for the player.
// This is a value that could be 1 for a win, 0.5 for remis and 0 for a loss
function getScoreForPlayer (player, winner) {
	if (winner === player)
		return 1
	if (winner.toLowerCase() === 'remis')
		return 0.5
	return 0 // Loss
}

// Returns the probability of each of the players winning the game given
// @param [Numerical] whiteRating
// @param [Numerical] blackRating
// @return [Object] Object containing the probabilities
function getPlayerProbability (whiteRating, blackRating) {
	whiteProbability = getProbability(blackRating, whiteRating)
	blackProbability = getProbability(whiteRating, blackRating)

	return { whiteProbability, blackProbability }
}

// Returns the probability that a player will win against another team
// @param [Numerical] opposingTeamAvg
// @param [Numerical] rating
// @return [Numerical]
function getProbability (opposingTeamAvg, rating) {
	return 1 / (1 + Math.pow(10, (opposingTeamAvg - rating) / 400))
}

// Return the ranking of a player
// @param [String] key
async function getRating (key) {
	let player = await db.getPlayer(key)
	if (player && player.ranking) return player.ranking
}

// Returns the average of the given numbers
// @param [Numerical] player1
// @param [Numerical] player2
// @return [Numerical]
function averageRating (player1, player2) {
	total = player1 + player2
	return total / 2
}

// Transforms a rating based on the given parameters
// @param [Numerical] currentRating
// @param [Numerical] result (0 for loss or 1 for win)
// @param [Numerical] probability
// @param [Numerical] difference The difference in goals
function getNewRating (currentRating, result, probability) {
	return currentRating + (DEFAULT_KFACTOR * (result - probability))
}

// Validates the object given to addGame
// Makes sure it contains the correct properties
// @param [Object] data
async function _validateGame (data) {
	console.log('_validateGame', data, !_.isString(data.white), !_.isString(data.black))
	if (!data || !_.isString(data.white) || !_.isString(data.black)) {
		throw new Error("Missing player data in game object")
	}

	let existingWhite = await db.getPlayer(data.white)
	let existingBlack = await db.getPlayer(data.black)
	if (!existingWhite || !existingBlack) {
		throw new Error("One or more players does not exist")
	}

	if(!data.winner) {
		throw new Error("No result submitted")
	}
}

module.exports = calculateGame
