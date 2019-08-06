firebase = require 'firebase'
firebaseConfig = require './firebaseConfig'

SEASON_PATH = process.env.season || '/'
PLAYERS_PATH = process.env.players || 'players/'
MATCHES_PATH = process.env.matches || 'matches/'

class Database

	initialized: false
	closed: false

	# @param [Function] cb The function to call when all listeners have been set up
	constructor: (cb) ->
		# Because of the way lambda works, we need to make sure to not initialize the firebase
		# app if one already exsits in another function
		if firebase.apps.length is 0
			firebase.initializeApp(@_getConfig())

		@db ?= firebase.database()

		@_setupListeners()

	# Closes the connection to the db
	close: ->
		@initialized = false
		@closed = true
		delete @players
		delete @matches
		@db?.goOffline()

	open: ->
		if @closed
			@db?.goOnline()
			@closed = false
			@_setupListeners()

	# Set a callback to be called when the database is initialized
	# Will call the callback if already initialized
	# @param [Function] cb
	onInitialized: (cb) ->
		@cb = cb
		if @players? and @matches?
			@cb?()

	onMatchesUpdated: ->
		if @players? and not @initialized
			@cb?()
			@initialized = true

	onPlayersUpdated: ->
		if @matches? and not @initialized
			@cb?()
			@initialized = true

	# Return the current player list
	# @return [Object] players
	getPlayers: -> @players

	# Return the current match list
	# @return [Array] matches
	getMatches: -> @matches

	# Returns a specific game by id
	# @param [String]
	# @return [Object]
	getMatch: (id) ->
		path = "#{SEASON_PATH}#{MATCHES_PATH}"
		@matches[id]

	# Returns a specific player
	# @param [String] key
	# @return [Object] player
	getPlayer: (key) ->
		return @players?[key]

	# Updates the entire match history
	# @param [Object] newHistory
	updateMatches: (newHistory) ->
		path = "#{SEASON_PATH}#{MATCHES_PATH}"
		@_update(path, newHistory)

	# Updates a players object in the database
	# @param [String] key
	# @param [Object] player
	updatePlayer: (key, object) ->
		path = "#{SEASON_PATH}#{PLAYERS_PATH}#{key}"
		@_update(path, object)

	# Adds a game to the matches list
	# @param [Object] object
	addGame: (object) ->
		path = "#{SEASON_PATH}#{MATCHES_PATH}"
		@_push(path, object)

	# Removes a game from the match history
	# @param [String] id
	removeGame: (id) ->
		path = "#{SEASON_PATH}#{MATCHES_PATH}#{id}"
		@_remove(path)

	# Sets up listeners that the database should update live
	# @param [Function] cb The function to call when all listeners have been set up
	# @private
	_setupListeners: () ->
		@db.ref("#{SEASON_PATH}#{PLAYERS_PATH}").once('value', (result) =>
			console.log "PLAYERS UPDATED"
			@players = result.val()
			@players ?= {}

			@onPlayersUpdated()
		)

		@db.ref("#{SEASON_PATH}#{MATCHES_PATH}").once('value', (result) =>
			console.log "MATCHES UPDATED"
			@matches = result.val()
			@matches ?= {}

			@onMatchesUpdated()
		)

	# Remove a path on the db
	# @param [String] path
	# @private
	_remove: (path) ->
		@db.ref(path).remove()

	# Pushes a value to a list
	# @param [String] path
	# @param [Object] data
	# @private
	_push: (path, data) ->
		unless path?
			throw new Error("Missing parameter \"path\" in db._push")
			return

		unless data?
			throw new Error("Missing parameter \"data\" in db._push")
			return

		if path.indexOf('undefined') >= 0
			throw new Error("path includes undefined in db._push")
			return

		@db.ref(path).push(data)

	# Updates some path in the database
	# @param [String] path
	# @param [Object] data
	# @private
	_update: (path, data) ->
		unless path?
			throw new Error("Missing parameter \"path\" in db._update")
			return

		unless data?
			throw new Error("Missing parameter \"data\" in db._update")
			return

		if path.indexOf('undefined') >= 0
			throw new Error("path includes undefined in db._update")
			return

		@db.ref(path).update(data)

	# Returns the firebase conneciton config
	# @return [Object]
	# @private
	_getConfig: ->
		console.log(process.argv)
		if process.argv.indexOf("-debug") > -1
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
