firebase = require 'firebase'
firebaseConfig = require './firebaseConfig'

SEASON_PATH = process.env.season || '/'
PLAYERS_PATH = process.env.players || 'players/'
MATCHES_PATH = process.env.matches || 'matches/'

class Database

	# @param [Function] cb The function to call when all listeners have been set up
	constructor: (cb) ->
		firebase.initializeApp(@_getConfig());
		@db = firebase.database()

		@_setupListeners()

	# Set a callback to be called when the database is initialized
	# Will call the callback if already initialized
	# @param [Function] cb
	onInitialized: (cb) ->
		@cb = cb
		if @players? and @matches?
			@cb?()

	# Return the current player list
	# @return [Object] players
	getPlayers: -> @players

	# Return the current match list
	# @return [Array] matches
	getMatches: -> @matches

	# Returns a specific player
	# @param [String] key
	# @return [Object] player
	getPlayer: (key) ->
		return @players?[key]

	# Updates a players object in the database
	# @param [String] key
	# @param [Object] player
	updatePlayer: (key, object, cb) ->
		path = "#{SEASON_PATH}#{PLAYERS_PATH}#{key}"
		@_update(path, object, cb)

	# Adds a game to the matches list
	# @param [Object] object
	addGame: (object) ->
		path = "#{SEASON_PATH}#{MATCHES_PATH}"
		@_push(path, object)

	# Closes the connection to the db
	close: ->
		@db.goOffline()

	# Sets up listeners that the database should update live
	# @param [Function] cb The function to call when all listeners have been set up
	# @private
	_setupListeners: () ->
		@db.ref("#{SEASON_PATH}#{PLAYERS_PATH}").once('value', (result) =>
			@players = result.val()
			@players ?= {}

			@cb?() if @matches?
		)

		@db.ref("#{SEASON_PATH}#{MATCHES_PATH}").once('value', (result) =>
			@matches = result.val()
			@matches ?= {}

			@cb?() if @players?
		)

	# Pushes a value to a list
	# @param [String] path
	# @param [Object] data
	# @private
	_push: (path, data, cb) ->
		unless path?
			throw new Error("Missing parameter \"path\" in db._push")
			return

		unless data?
			throw new Error("Missing parameter \"data\" in db._push")
			return

		if path.indexOf('undefined') >= 0
			throw new Error("path includes undefined in db._push")
			return

		@db.ref(path).push(data, cb)

	# Updates some path in the database
	# @param [String] path
	# @param [Object] data
	# @private
	_update: (path, data, cb) ->
		unless path?
			throw new Error("Missing parameter \"path\" in db._update")
			return

		unless data?
			throw new Error("Missing parameter \"data\" in db._update")
			return

		if path.indexOf('undefined') >= 0
			throw new Error("path includes undefined in db._update")
			return

		@db.ref(path).update(data, cb)

	# Returns the firebase conneciton config
	# @return [Object]
	# @private
	_getConfig: ->
		if process.argv[2] is "debug"
			console.log "using debug version"
			return firebaseConfig

		@_validateEnvironment()
		return {
			apiKey: process.env.apiKey
			authDomain: process.env.authDomain
			databaseURL: process.env.databaseURL
			projectId: process.env.projectId
			storageBucket: process.env.storageBucket
			messagingSenderId: process.env.messagingSenderId
		}

	# Validates that everything we need from the environment is available
	# @private
	_validateEnvironment: ->
		unless process.env.apiKey?
			throw new Error("Missing apiKey in environment")

		unless process.env.authDomain?
			throw new Error("Missing authDomain in environment")

		unless process.env.databaseURL?
			throw new Error("Missing databaseURL in environment")

		unless process.env.projectId?
			throw new Error("Missing projectId in environment")

		unless process.env.storageBucket?
			throw new Error("Missing storageBucket in environment")

		unless process.env.messagingSenderId?
			throw new Error("Missing messagingSenderId in environment")

		unless process.env.players?
			throw new Error("Missing players path in environment")

		unless process.env.matches?
			throw new Error("Missing matches path in environment")

		unless process.env.season?
			throw new Error("Missing season path in environment")

module.exports = new Database()