db = require './database'
addGame = require './actions/addGame'
addPlayer = require './actions/addPlayer'
removeGame = require './actions/removeGame'
createResponse = require './utils/createResponse'

delegate = (e, context, callback) ->
	context?.callbackWaitsForEmptyEventLoop = false
	data = e.queryStringParameters
	data ?= e
	console.log('Received event', data)
	try
		db.open()
		db.onInitialized(() =>
			console.log('Firebase DB initialized')
			switch data.action
				when 'addGame'
					console.log("Identified action as addGame")
					addGame(data, (err, msg) ->
						if err
							console.log('Received error', error)
						db.close()
						console.log(msg)
						callback?(null, createResponse(msg))
					)
				when 'addPlayer'
					console.log("Identified action as addPlayer")
					addPlayer(data.name, (err, msg) ->
						if err
							console.log('Received error', error)
						db.close()
						console.log(msg)
						callback?(null, createResponse(msg))
					)
				when 'removeGame'
					console.log("Identified action as removeGame")
					removeGame(data.id, (err, msg) ->
						if err
							console.log('Received error', error)
						db.close()
						console.log(msg)
						callback?(null, createResponse(msg))
					)
				else
					callback?(null, createResponse("Failed: no such action"))
		)
	catch err
		console.log(err)
		callback?(createResponse(err))

module.exports.handler = delegate
