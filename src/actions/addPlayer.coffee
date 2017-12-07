db = require '../database'

addPlayer = (name, cb) ->
	try
		_validateName(name)
	catch err
		cb?(err)

	name = name.toLowerCase()

	# Don't add player if it already exists
	if db.getPlayer(name)?
		cb("Player already exists")
		return

	player =
		ranking: 1200
		streak: 0
		wins: 0
		losses: 0

	db.updatePlayer(name, player)
	.then((result) ->
		cb?(null, "Successfully added player")
	).catch((err) ->
		callback(err)
	)

# Validates a players name
# Will decline if it is undefined or an empty string
_validateName = (name) ->
	unless name?.length > 0
		throw new Error("Player name cannot be empty")

module.exports = addPlayer