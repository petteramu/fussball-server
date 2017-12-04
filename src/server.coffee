db = require './database'
addGame = require './actions/addGame'
addPlayer = require './actions/addPlayer'
removeGame = require './actions/removeGame'

delegate = (e, context, callback) ->
	context?.callbackWaitsForEmptyEventLoop = false
	try
		db.onInitialized(() =>
			db.open()
			switch e.action
				when 'addGame'
					addGame(e, (err, msg) ->
						db.close()
						console.log(msg)
						callback?(null, msg)
					)
				when 'addPlayer'
					addPlayer(e, (err, msg) ->
						db.close()
						console.log(msg)
						callback?(null, msg)
					)
				when 'removeGame'
					removeGame(e.id, (err, msg) ->
						db.close()
						console.log(msg)
						callback?(null, msg)
					)
				else
					callback?("Failed: no such action")
		)
	catch err
		callback(err)

module.exports.handler = delegate
