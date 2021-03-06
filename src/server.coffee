db = require './database'
addGame = require './actions/addGame'
addPlayer = require './actions/addPlayer'
removeGame = require './actions/removeGame'

delegate = (e, context, callback) ->
	context?.callbackWaitsForEmptyEventLoop = false
	data = e.queryStringParameters
	data ?= e
	try
		db.open()
		db.onInitialized(() =>
			switch data.action
				when 'addGame'
					addGame(data, (err, msg) ->
						db.close()
						console.log(msg)
						callback?(null, createResponse(msg))
					)
				when 'addPlayer'
					addPlayer(data.name, (err, msg) ->
						db.close()
						console.log(msg)
						callback?(null, createResponse(msg))
					)
				when 'removeGame'
					removeGame(data.id, (err, msg) ->
						db.close()
						console.log(msg)
						callback?(null, createResponse(msg))
					)
				else
					callback?(null, createResponse("Failed: no such action"))
		)
	catch err
		callback?(createResponse(err))

createResponse = (msg) ->
	body =
		message: msg

	response =
		headers:
			"Access-Control-Allow-Origin": "http://petteramu.com"
		statusCode: 200
		body: JSON.stringify(body)

	return response

module.exports.handler = delegate
