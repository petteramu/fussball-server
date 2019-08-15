const _ = require('lodash')
const dbFactory = require('../database/DynamoDBRepository')
const db = dbFactory.getInstance()
const uuid = require('uuid/v1')

// Based on https://en.wikipedia.org/wiki/Round-robin_tournament#Scheduling_algorithm
async function createRoundRobinSchedule(players, double, shuffle = true) {
    if(players == undefined || !Array.isArray(players))
        throw new Error("Players are undefined or not an array in _createRoundRobinSchedule")
    if(double == undefined || typeof double !== "boolean")
        throw new Error("Double is undefined or not a boolean in _createRoundRobinSchedule")

    const DUMMY = { name: 'BYE' }
	if(players.length % 2)
		players.unshift(DUMMY)

	let rounds = []
	for(let i = 0; i < players.length - 1; i++) rounds.push([])

	for(let i = 0; i < rounds.length; i++) {
		let round = rounds[i]
		for(let y = 0; y < players.length / 2; y++) {
			let player = players[y]
			let opponent = players[players.length - 1 - y]

			if(player === DUMMY || opponent === DUMMY) continue

            if((player == players[0] || opponent == players[0]) && i % 2 == 1) {
                let temp = player
                player = opponent
                opponent = temp
            }
			round.push({
                id: uuid(),
				white: player.name,
                black: opponent.name,
                round: i + 1
			})
		}
		// Rotate the players to change up the matches
        (players[0] === DUMMY) ? players.splice(1, 0, players.pop()) : players.splice(1, 0, players.pop())
	}

    if(shuffle) rounds = _.shuffle(rounds)

	if(double) {
		// Duplicate matches but reverse black and white if
		// this is a double round robin
		let reverse = []
		for(let i = 0; i < rounds.length; i++) {
			let reverseRound = []
			for(let y = 0; y < rounds[i].length; y++) {
				let match = rounds[i][y]
				reverseRound.push({
                    id: uuid(),
					white: match.black,
					black: match.white,
                    round: i + rounds.length + 1
				})
			}
			reverse.push(reverseRound)
		}
		rounds = rounds.concat(reverse)
    }
    return _.flatten(rounds)
}

module.exports = createRoundRobinSchedule