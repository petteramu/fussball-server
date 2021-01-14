function updateStatsFromRemis(player, ranking) {
    updateStats(player, ranking)
	player.streak = 0
	player.remis = (player.remis) ? player.remis : 0
	player.remis++
}

function updateStatsFromWin(player, ranking) {
    updateStats(player, ranking)
	player.streak = (player.streak) ? player.streak : 0
	if (player.streak < 0)
		player.streak = 1
	else
		player.streak++

	player.wins = (player.wins) ? player.wins : 0
	player.wins++
}

function updateStatsFromLoss(player, ranking) {
    updateStats(player, ranking)
	player.streak = (player.streak) ? player.streak : 0
	if (player.streak > 0)
		player.streak = -1
	else
		player.streak--
	
	player.losses = (player.losses) ? player.losses : 0
	player.losses++
}

function updateStats(player, ranking) {
	player.lastUpdated = new Date().getTime()
	player.ranking = ranking

	if(player.peak == undefined || ranking > player.peak)
		player.peak = ranking
}

module.exports = {
	updateStatsFromWin,
	updateStatsFromRemis,
	updateStatsFromLoss
}