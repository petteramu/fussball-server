db = require './database'
addGame = require './actions/addGame'

handler = (e, context, callback) ->
	db.onInitialized(() =>
		addGame(e, (msg) =>
			db.close()
			console.log(msg)
			callback?(msg)
		)
	)

game =
	winner1: 'pawel'
	winner2: 'petter'
	loser1: 'andrea'
	loser2: 'thomas'
	difference: 10

handler(game)