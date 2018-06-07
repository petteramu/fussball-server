calculateGame = require '../utils/calculateGame'
db = require '../database'

findLastMatch = (matches) ->
	for key, match of matches

		if not last? or last.timestamp < match.timestamp
			lastKey = key
			lastMatch = match

	return { key: lastKey, lastMatch: lastMatch }

# Removes a game from the history
# If the game is the latest game entered, it simply rolls back the history
# If it is not the last game, the whole history is recalculated
# @param [String] id
# @param [Function] cb
removeGame = (id, cb) ->
	unless id?.length > 0
		cb?('No id given to removeGame')
		return

	matches = db.getMatches()

	unless matches?[id]?
		cb?("Game with id #{id} does not exist")
		return

	{ key, lastMatch } = findLastMatch(matches)

	console.log("key: #{key}, last: #{lastMatch}")
	if key is id
		removeLast(id, lastMatch, cb)
	else
		removeFromMiddle(id, cb)

# Removes a match from the middle of the match list
# @param [String] id
removeFromMiddle = (id, cb) ->
	console.log('removeFromMiddle')
	players = db.getPlayers()
	matches = db.getMatches()

	# Reset the player rankings. The DB should only fetch this once
	# and therefore it will not be updated in the db instance, meaning the new
	# reset ranking will be used in the calculation below, but not be updated
	# on the server until we are done
	resetPlayers(players)

	console.log "id to remove: #{id}"
	# Remove the game
	delete matches[id]

	console.log "post:", matches

	newHistory = {}
	for key, match of matches
		# Remember the original timestamp
		originalTimestamp = match.timestamp

		# Recalculate the games result
		{ newGame, newWinner1Elo, newWinner2Elo, newLoser1Elo, newLoser2Elo } = calculateGame
			winner1: match.winners[0].key
			winner2: match.winners[1].key
			loser1: match.losers[0].key
			loser2: match.losers[1].key
			difference: match.difference

		newGame.timestamp = originalTimestamp
		newHistory[key] = newGame
		players[match.winners[0].key].ranking = newWinner1Elo
		players[match.winners[1].key].ranking = newWinner2Elo
		players[match.losers[0].key].ranking = newLoser1Elo
		players[match.losers[1].key].ranking = newLoser2Elo

		incrementStreak(players[match.winners[0].key], true)
		incrementStreak(players[match.winners[1].key], true)
		incrementStreak(players[match.losers[0].key], false)
		incrementStreak(players[match.losers[1].key], false)

	promises = []
	promises.push db.removeGame(id)
	promises.push db.updateMatches(newHistory)
	for key, player of players
		promises.push db.updatePlayer(key, player)

	Promise.all(promises).then(() ->
		cb?(null, "Success")
	).catch((err) ->
		callback(err)
	)

incrementStreak = (player, win) ->
	if win
		player.wins++
		player.streak = if player.streak < 0 then 1 else player.streak + 1
	else
		player.losses++
		player.streak = if player.streak > 0 then -1 else player.streak - 1

# Resets the ranking of all players in the object
# @param [Object] players
resetPlayers = (players) ->
	console.log "pre:", players
	for key, player of players
		player.ranking = 1200
		player.streak = 0
		player.wins = 0
		player.losses = 0
	console.log "post:", players

# Removes the last game in the match history
# Will roll back the ranking for the players in it and remove the game
# @param [String] id
# @param [Object] lastMatch
removeLast = (id, lastMatch, cb) ->
	console.log('remove last')
	rollBackPlayer(lastMatch.winners[0])
	rollBackPlayer(lastMatch.winners[1])
	rollBackPlayer(lastMatch.losers[0])
	rollBackPlayer(lastMatch.losers[1])

	db.removeGame(id).then(() ->
		cb?("Success")
	).catch((err) ->
		callback(err)
	)

# Rolls back the rating for the given player
# @param [Object] data
# @option [String] key
# @option [String] loss
# @option [String] gain One of gain and loss must be present
rollBackPlayer = (data) ->
	player = db.getPlayer(data.key)

	if data.gain?
		player.ranking -= data.gain
	else if data.loss?
		player.ranking += data.loss
	else
		throw new Error("Player does not exist")

	# Reset streak
	player.streak = 0

	db.updatePlayer(data.key, player)

module.exports = removeGame
