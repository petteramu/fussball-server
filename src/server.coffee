db = require './database'
addGame = require './actions/addGame'
addPlayer = require './actions/addPlayer'

handler = (e, context, callback) ->
	db.onInitialized(() =>
		# addPlayer("christer")
		addGame(e, (msg) =>
			db.close()
			console.log(msg)
			callback?(msg)
		)
	)

game =
	winner1: 'petter'
	winner2: 'pawel'
	loser1: 'christer'
	loser2: 'thomas'
	difference: 10

handler(game)