db = require '../database'

addPlayer = (name) ->
	player =
		ranking: 1200

	db.updatePlayer(name, player)

module.exports = addPlayer